import { EvmAsset } from '../../asset'
import { getAddress, parseAbi, parseUnits, WalletClient } from 'viem'
import {
  readContract,
  signTypedData,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from 'viem/actions'

import { arbitrum, base, bsc, mainnet, polygon } from '@reown/appkit/networks'
import axios, { AxiosError } from 'axios'
import { defaultPaymentProviderOptions, PaymentProvider, PaymentProviderContext, PaymentProviderOptions } from './PaymentProvider'

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

export class EvmPaymentProvider extends PaymentProvider<EvmAsset> {
  client: WalletClient
  isGasAlreadySponsored = false

  constructor(context: PaymentProviderContext<EvmAsset>, options: PaymentProviderOptions, client: WalletClient) {
    super(context, options)
    this.client = client
  }

  private async permitGas(signature: string) {
    const { data } = await axios.post<PermitResponse>
    (`${this.context.payzapUrl}/v1/public/session/${this.context.sessionId}/permit`, {
      owner: this.context.userAddress,
      signature,
    })

    if (!data.success) {
      throw new Error('Failed to sponsor gas. Unable to permit gas sponsorship')
    }

    this.isGasAlreadySponsored = true
  }

  private async permitDataForGas(): Promise<PermitDataResponse['data']> {
    const { data } = await axios.post<PermitDataResponse>
    (`${this.context.payzapUrl}/v1/public/session/${this.context.sessionId}/permit-data`, {
      buyer: this.context.userAddress,
    })

    if (!data.success) {
      throw new Error('Failed to sponsor gas. Unable to get permit data')
    }

    return data.data
  }

  private async sponsorGas() {
    try {
      const { data } = await axios.post<SponsorGasResponse>
      (`${this.context.payzapUrl}/v1/public/session/${this.context.sessionId}/sponsor-gas`, {
        buyerAddress: this.context.userAddress,
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
      && ([arbitrum.id, polygon.id, bsc.id] as number[]).includes(chainId)) {
      return 'sponsor'
    }

    if (symbol === 'USDC' && chainId === bsc.id) {
      return 'sponsor'
    }

    return null
  }

  async approve() {
    const { asset, amount, merchantAddress, userAddress } = this.context
    const { onUpdateStatus = defaultPaymentProviderOptions.onUpdateStatus } = this.options || {}
    const parsedAmount = parseUnits(amount, asset.decimals)

    if (!this.client) {
      throw new Error('Wallet client is not defined')
    }

    onUpdateStatus('Preparing approval')

    const allowance = await readContract(this.client, {
      address: getAddress(asset.address),
      abi: assetAbi,
      functionName: 'allowance',
      args: [userAddress as `0x${string}`, merchantAddress as `0x${string}`],
    })

    onUpdateStatus('Waiting for approval signature')
    if (allowance && allowance < parsedAmount) {
      const resetHash = await writeContract(this.client, {
        account: this.client.account?.address!,
        chain: null,
        address: getAddress(asset.address),
        abi: assetAbi,
        functionName: 'approve',
        args: [merchantAddress as `0x${string}`, 0n],
      })
      await waitForTransactionReceipt(this.client, { hash: resetHash })
      const approveHash = await writeContract(this.client, {
        account: this.client.account?.address!,
        chain: null,
        address: getAddress(asset.address),
        abi: assetAbi,
        functionName: 'approve',
        args: [merchantAddress as `0x${string}`, parsedAmount],
      })
      onUpdateStatus('Confirming approval')
      await waitForTransactionReceipt(this.client, { hash: approveHash })
    }
    else if (allowance <= 0n) {
      const approveHash = await writeContract(this.client, {
        account: this.client.account?.address!,
        chain: null,
        address: getAddress(asset.address),
        abi: assetAbi,
        functionName: 'approve',
        args: [merchantAddress as `0x${string}`, parsedAmount],
      })
      onUpdateStatus('Confirming approval')
      await waitForTransactionReceipt(this.client, { hash: approveHash })
    }
  }

  async transfer() {
    const { asset, amount, merchantAddress, userAddress } = this.context
    const { onUpdateStatus = defaultPaymentProviderOptions.onUpdateStatus } = this.options || {}
    const parsedAmount = parseUnits(amount, asset.decimals)

    onUpdateStatus('Waiting for signature')
    const sim = await simulateContract(this.client, {
      address: asset.address as `0x${string}`,
      abi: assetAbi,
      functionName: 'transfer',
      account: userAddress as `0x${string}`,
      args: [merchantAddress as `0x${string}`, parsedAmount],
    })
    const hash = await writeContract(this.client, sim.request)
    onUpdateStatus('Confirming transaction')
    await waitForTransactionReceipt(this.client, {
      hash,
    })
  }

  async pay() {
    const { onUpdateStatus = defaultPaymentProviderOptions.onUpdateStatus } = this.options || {}
    const mechanism
      = !this.context.gasless || this.isGasAlreadySponsored
        ? null
        : EvmPaymentProvider.getSponsorshipMechanism(this.context.asset)

    let permitData: PermitDataResponse['data'] | undefined
    if (mechanism === 'permit') {
      onUpdateStatus('Preparing gas sponsorship')
      permitData = await this.permitDataForGas()
    }
    else if (mechanism === 'sponsor') {
      onUpdateStatus('Requesting gas sponsorship')
      await this.sponsorGas()
    }

    if (mechanism !== 'permit') {
      await this.approve()
    }

    if (mechanism === 'permit' && permitData) {
      onUpdateStatus('Signing gas permit')
      const signature = await signTypedData(this.client!, {
        account: this.client.account?.address!,
        domain: permitData.domain,
        types: permitData.types,
        primaryType: permitData.primaryType,
        message: permitData.message,
      })
      onUpdateStatus('Submitting gas permit')
      await this.permitGas(signature)
      return
    }

    await this.transfer()
  }
}
