import {
  defaultPaymentChainPayOptions, PaymentChain,
  PaymentChainPayContext, PaymentChainPayOptions,
} from '@/entities/payment/PaymentChain'
import { EvmAsset } from '@/entities/asset'
import { getAddress, parseAbi } from 'viem'
import {
  readContract,
  signTypedData,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from '@wagmi/core'
import { wagmiAdapter } from '@/entities/config'
import { arbitrum, base, bsc, mainnet, polygon } from '@reown/appkit/networks'
import axios, { AxiosError } from 'axios'

type PermitResponse = {
  success: true
  data: {
    status: string
    sessionId: string
  }
}
type PermitDataResponse = {
  success: boolean
  data: {
    domain: {
      name: string
      version: string
      chainId: number
      verifyingContract: `0x${string}`
    }
    types: Record<string, unknown>
    primaryType: string
    message: {
      owner: string
      spender: string
      value: string
      nonce: string
      deadline: string
    }
  }
}
type SponsorGasResponse = {
  success: boolean
  data: {
    status: string
    sessionId: string
    txHash: string
    gasAmountWei: string
  }
}

const assetAbi = parseAbi([
  'function approve(address, uint256) returns (bool)',
  'function allowance(address, address) external view returns (uint256)',
  'function transfer(address, uint256) returns ()',
])

export class EvmPaymentChain extends PaymentChain<EvmAsset> {
  isGasAlreadySponsored = false
  payzapUrl: string
  wagmiConfig = wagmiAdapter.wagmiConfig

  constructor(config: { payzapUrl: string }) {
    super()
    this.payzapUrl = config.payzapUrl
  }

  private async permitGas(context: PaymentChainPayContext<EvmAsset>, signature: string) {
    const { data } = await axios.post<PermitResponse>
    (`${this.payzapUrl}/v1/public/session/${context.sessionId}/permit`, {
      owner: context.userAddress,
      signature,
    })

    if (!data.success) {
      throw new Error('Failed to sponsor gas. Unable to permit gas sponsorship')
    }

    this.isGasAlreadySponsored = true
  }

  private async permitDataForGas(context: PaymentChainPayContext<EvmAsset>): Promise<PermitDataResponse['data']> {
    const { data } = await axios.post<PermitDataResponse>
    (`${this.payzapUrl}/v1/public/session/${context.sessionId}/permit-data`, {
      buyer: context.userAddress,
    })

    if (!data.success) {
      throw new Error('Failed to sponsor gas. Unable to get permit data')
    }

    return data.data
  }

  private async sponsorGas(context: PaymentChainPayContext<EvmAsset>) {
    try {
      const { data } = await axios.post<SponsorGasResponse>
      (`${this.payzapUrl}/v1/public/session/${context.sessionId}/sponsor-gas`, {
        buyerAddress: context.userAddress,
      })

      if (!data.success) {
        throw new Error('Failed to sponsor gas')
      }

      this.isGasAlreadySponsored = true
    }
    catch (e) {
      if (e instanceof AxiosError && e.status === 429) {
        // Rate limit exceeded, just allow going further
        return
      }
      throw e
    }
  }

  static getSponsorshipMechanism(asset: EvmAsset) {
    const chainId = Number(asset.chain.id)
    const symbol = asset.symbol.toUpperCase()

    if (symbol === 'USDC'
      && ([base.id, arbitrum.id, polygon.id] as number[]).includes(chainId)) {
      return 'permit'
    }

    if (symbol === 'USDT'
      && ([base.id, arbitrum.id, polygon.id, bsc.id] as number[]).includes(chainId)) {
      return 'sponsor'
    }

    if (symbol === 'USDC' && chainId === bsc.id) {
      return 'sponsor'
    }

    return null
  }

  async approve(context: PaymentChainPayContext<EvmAsset>, options?: PaymentChainPayOptions) {
    const { asset, amount, merchantAddress, userAddress } = context
    const { onUpdateStatus = defaultPaymentChainPayOptions.onUpdateStatus } = options || {}

    if (!this.wagmiConfig) {
      throw new Error('Wallet provider is not defined')
    }

    onUpdateStatus('Preparing approval')

    const allowance = await readContract(this.wagmiConfig, {
      address: getAddress(asset.address),
      abi: assetAbi,
      functionName: 'allowance',
      args: [userAddress as `0x${string}`, merchantAddress as `0x${string}`],
    })

    onUpdateStatus('Waiting for approval signature')
    if (allowance && allowance < amount) {
      const resetHash = await writeContract(this.wagmiConfig, {
        address: getAddress(asset.address),
        abi: assetAbi,
        functionName: 'approve',
        args: [merchantAddress as `0x${string}`, 0n],
      })
      await waitForTransactionReceipt(this.wagmiConfig, { hash: resetHash })
      const approveHash = await writeContract(this.wagmiConfig, {
        address: getAddress(asset.address),
        abi: assetAbi,
        functionName: 'approve',
        args: [merchantAddress as `0x${string}`, amount],
      })
      onUpdateStatus('Confirming approval')
      await waitForTransactionReceipt(this.wagmiConfig, { hash: approveHash })
    }
    else if (allowance <= 0n) {
      const approveHash = await writeContract(this.wagmiConfig, {
        address: getAddress(asset.address),
        abi: assetAbi,
        functionName: 'approve',
        args: [merchantAddress as `0x${string}`, amount],
      })
      onUpdateStatus('Confirming approval')
      await waitForTransactionReceipt(this.wagmiConfig, { hash: approveHash })
    }
  }

  async transfer(context: PaymentChainPayContext<EvmAsset>, options: PaymentChainPayOptions) {
    const { asset, amount, merchantAddress, userAddress } = context
    const { onUpdateStatus = defaultPaymentChainPayOptions.onUpdateStatus } = options || {}

    onUpdateStatus('Waiting for signature')
    const sim = await simulateContract(this.wagmiConfig, {
      address: asset.address as `0x${string}`,
      abi: assetAbi,
      functionName: 'transfer',
      account: userAddress as `0x${string}`,
      args: [merchantAddress as `0x${string}`, amount],
    })
    const hash = await writeContract(this.wagmiConfig, sim.request)
    onUpdateStatus('Confirming transaction')
    await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
      hash,
    })
  }

  async pay(context: PaymentChainPayContext<EvmAsset>, options: PaymentChainPayOptions) {
    const { onUpdateStatus = defaultPaymentChainPayOptions.onUpdateStatus } = options || {}
    const mechanism
      = !context.gasless || this.isGasAlreadySponsored
        ? null
        : EvmPaymentChain.getSponsorshipMechanism(context.asset)

    let permitData: PermitDataResponse['data'] | undefined
    if (mechanism === 'permit') {
      onUpdateStatus('Preparing gas sponsorship')
      permitData = await this.permitDataForGas(context)
    }
    else if (mechanism === 'sponsor') {
      onUpdateStatus('Requesting gas sponsorship')
      await this.sponsorGas(context)
    }

    await this.approve(context, options)

    if (mechanism === 'permit' && permitData) {
      onUpdateStatus('Signing gas permit')
      const signature = await signTypedData(this.wagmiConfig!, {
        domain: permitData.domain,
        types: permitData.types,
        primaryType: permitData.primaryType,
        message: permitData.message,
      })
      onUpdateStatus('Submitting gas permit')
      await this.permitGas(context, signature)
    }

    await this.transfer(context, options)
  }
}
