import {
  defaultPaymentChainPayOptions,
  PaymentChainPayContext, PaymentChainPayOptions,
} from '@/entities/payment/PaymentChain'
import { EvmAsset } from '@/entities/asset'
import { getAddress, parseAbi } from 'viem'
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from '@wagmi/core'
import { wagmiAdapter } from '@/entities/config'

const assetAbi = parseAbi([
  'function approve(address, uint256) returns (bool)',
  'function allowance(address, address) external view returns (uint256)',
  'function transfer(address, uint256) returns ()',
])

export class EvmPaymentChain {
  wagmiConfig = wagmiAdapter.wagmiConfig

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
    await this.approve(context, options)
    await this.transfer(context, options)
  }
}
