import { getAddress, parseAbi, parseUnits, SignTypedDataParameters, WalletClient } from 'viem'
import {
  readContract,
  signTypedData,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from 'viem/actions'
import {
  ChainExecutorApproveParams,
  ChainExecutorTransferParams,
  IChainExecutor,
  ExecutorEvent,
} from '../executor'
import { EvmAsset } from '../asset'

const assetAbi = parseAbi([
  'function approve(address, uint256) returns (bool)',
  'function allowance(address, address) external view returns (uint256)',
  'function transfer(address, uint256) returns ()',
])

export type EvmExecutorEvents = {
  status: string
}

export class EvmExecutor implements IChainExecutor<EvmAsset> {
  type = 'evm'
  client: WalletClient

  constructor(client: WalletClient) {
    this.client = client
  }

  validateAsset(asset: EvmAsset) {
    if (!asset?.address) {
      throw new Error('Asset does not have an address')
    }

    if (!asset?.decimals) {
      throw new Error('Asset does not have decimals')
    }
  }

  sign(data: SignTypedDataParameters) {
    return signTypedData(this.client, data)
  }

  async approve(params: ChainExecutorApproveParams<EvmAsset>, onUpdate?: (event: ExecutorEvent) => void) {
    this.validateAsset(params.asset)
    const { asset, amount, fromAddress, toAddress } = params
    const parsedAmount = parseUnits(amount, asset.decimals)

    if (!this.client) {
      throw new Error('Wallet client is not defined')
    }

    onUpdate?.({ type: 'approval:preparing' })

    const allowance = await readContract(this.client, {
      address: getAddress(asset.address),
      abi: assetAbi,
      functionName: 'allowance',
      args: [fromAddress as `0x${string}`, toAddress as `0x${string}`],
    })

    let receipt
    if (allowance && allowance < parsedAmount) {
      const resetHash = await writeContract(this.client, {
        account: this.client.account?.address!,
        chain: null,
        address: getAddress(asset.address),
        abi: assetAbi,
        functionName: 'approve',
        args: [toAddress as `0x${string}`, 0n],
      })
      await waitForTransactionReceipt(this.client, { hash: resetHash })
      const approveHash = await writeContract(this.client, {
        account: this.client.account?.address!,
        chain: null,
        address: getAddress(asset.address),
        abi: assetAbi,
        functionName: 'approve',
        args: [toAddress as `0x${string}`, parsedAmount],
      })
      onUpdate?.({ type: 'approval:signing' })
      receipt = await waitForTransactionReceipt(this.client, { hash: approveHash })
      onUpdate?.({ type: 'approval:completed' })
      return receipt
    }
    else if (allowance <= 0n) {
      const approveHash = await writeContract(this.client, {
        account: this.client.account?.address!,
        chain: null,
        address: getAddress(asset.address),
        abi: assetAbi,
        functionName: 'approve',
        args: [toAddress as `0x${string}`, parsedAmount],
      })
      onUpdate?.({ type: 'approval:confirming' })
      receipt = await waitForTransactionReceipt(this.client, { hash: approveHash })
      onUpdate?.({ type: 'approval:completed' })
      return receipt
    }
  }

  async transfer(params: ChainExecutorTransferParams<EvmAsset>, onUpdate?: (event: ExecutorEvent) => void) {
    const { asset, amount, fromAddress, toAddress } = params
    const parsedAmount = parseUnits(amount, asset.decimals)

    onUpdate?.({ type: 'transfer:preparing' })
    const sim = await simulateContract(this.client, {
      address: asset.address as `0x${string}`,
      abi: assetAbi,
      functionName: 'transfer',
      account: fromAddress as `0x${string}`,
      args: [toAddress as `0x${string}`, parsedAmount],
    })
    const hash = await writeContract(this.client, sim.request)
    onUpdate?.({ type: 'transfer:confirming' })
    const receipt = await waitForTransactionReceipt(this.client, {
      hash,
    })
    onUpdate?.({ type: 'transfer:completed' })
    return receipt
  }
}
