import { getAddress, maxUint256, parseAbi, parseUnits, SignTypedDataParameters, WalletClient } from 'viem'
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
  ExecutorError,
  ExecutorErrorCode,
} from '../executor'
import { EvmAsset } from '../asset/evm'

const assetAbi = parseAbi([
  'function approve(address, uint256) returns (bool)',
  'function allowance(address, address) external view returns (uint256)',
  'function transfer(address, uint256) returns ()',
])

export class EvmExecutor implements IChainExecutor<EvmAsset> {
  type = 'evm'
  client: WalletClient

  constructor(client: WalletClient) {
    this.client = client
  }

  validateAsset(asset: EvmAsset) {
    if (!asset?.address) {
      throw new ExecutorError('Asset does not have an address', {
        code: 'invalid_asset',
        chain: 'eip155',
        chainId: asset?.chain?.id,
        assetAddress: asset?.address,
      })
    }

    if (!Number.isInteger(asset.decimals) || asset.decimals < 0) {
      throw new ExecutorError('Asset does not have valid decimals', {
        code: 'invalid_asset',
        chain: 'eip155',
        chainId: asset.chain.id,
        assetAddress: asset.address,
      })
    }
  }

  sign(data: SignTypedDataParameters) {
    try {
      return signTypedData(this.client, data)
    }
    catch (cause) {
      if (cause instanceof ExecutorError && cause.operation) {
        throw cause
      }

      const chainId = data.domain?.chainId
      throw new ExecutorError('Failed to sign typed data', {
        cause,
        code: cause instanceof ExecutorError ? cause.code : 'signing_failed',
        operation: 'sign',
        chain: 'eip155',
        chainId: typeof chainId === 'bigint' ? Number(chainId) : chainId,
      })
    }
  }

  async approve(params: ChainExecutorApproveParams<EvmAsset>, onUpdate?: (event: ExecutorEvent) => void) {
    const { asset, amount, fromAddress, toAddress, force } = params
    let transactionHash: string | undefined
    let errorCode: ExecutorErrorCode = 'invalid_amount'

    try {
      this.validateAsset(asset)
      if (!this.client) {
        throw new ExecutorError('Wallet client is not defined', {
          code: 'client_error',
          operation: 'approve',
          chain: 'eip155',
          chainId: asset.chain.id,
          assetAddress: asset.address,
          fromAddress,
          toAddress,
          amount,
        })
      }

      const parsedAmount = amount === 'infinite' ? maxUint256 : parseUnits(amount, asset.decimals)
      onUpdate?.({ type: 'approval:preparing' })

      errorCode = 'read_failed'
      const allowance = await readContract(this.client, {
        address: getAddress(asset.address),
        abi: assetAbi,
        functionName: 'allowance',
        args: [fromAddress as `0x${string}`, toAddress as `0x${string}`],
      })

      if (allowance >= parsedAmount && !force) {
        onUpdate?.({ type: 'approval:completed' })
        return
      }

      if (allowance > 0n) {
        errorCode = 'signing_failed'
        onUpdate?.({ type: 'approval:signing' })
        transactionHash = await writeContract(this.client, {
          account: this.client.account?.address!,
          chain: null,
          address: getAddress(asset.address),
          abi: assetAbi,
          functionName: 'approve',
          args: [toAddress as `0x${string}`, 0n],
        })
        errorCode = 'confirmation_failed'
        await this.waitForSuccessfulReceipt(transactionHash, params, 'approve')
      }

      errorCode = 'signing_failed'
      onUpdate?.({ type: 'approval:signing' })
      transactionHash = await writeContract(this.client, {
        account: this.client.account?.address!,
        chain: null,
        address: getAddress(asset.address),
        abi: assetAbi,
        functionName: 'approve',
        args: [toAddress as `0x${string}`, parsedAmount],
      })
      errorCode = 'confirmation_failed'
      onUpdate?.({ type: 'approval:confirming' })
      const receipt = await this.waitForSuccessfulReceipt(transactionHash, params, 'approve')
      onUpdate?.({ type: 'approval:completed' })
      return receipt
    }
    catch (cause) {
      const error = this.toExecutorError(cause, errorCode, params, 'approve', transactionHash)
      onUpdate?.({ type: 'approval:failed', error })
      throw error
    }
  }

  async transfer(params: ChainExecutorTransferParams<EvmAsset>, onUpdate?: (event: ExecutorEvent) => void) {
    const { asset, amount, fromAddress, toAddress } = params
    let transactionHash: string | undefined
    let errorCode: ExecutorErrorCode = 'invalid_amount'

    try {
      this.validateAsset(asset)
      if (!this.client) {
        throw new ExecutorError('Wallet client is not defined', {
          code: 'client_error',
          operation: 'transfer',
          chain: 'eip155',
          chainId: asset.chain.id,
          assetAddress: asset.address,
          fromAddress,
          toAddress,
          amount,
        })
      }

      const parsedAmount = parseUnits(amount, asset.decimals)
      onUpdate?.({ type: 'transfer:preparing' })
      errorCode = 'simulation_failed'
      const sim = await simulateContract(this.client, {
        address: asset.address as `0x${string}`,
        abi: assetAbi,
        functionName: 'transfer',
        account: fromAddress as `0x${string}`,
        args: [toAddress as `0x${string}`, parsedAmount],
      })
      errorCode = 'signing_failed'
      transactionHash = await writeContract(this.client, sim.request)
      errorCode = 'confirmation_failed'
      onUpdate?.({ type: 'transfer:confirming' })
      const receipt = await this.waitForSuccessfulReceipt(transactionHash, params, 'transfer')
      onUpdate?.({ type: 'transfer:completed' })
      return receipt
    }
    catch (cause) {
      const error = this.toExecutorError(cause, errorCode, params, 'transfer', transactionHash)
      onUpdate?.({ type: 'transfer:failed', error })
      throw error
    }
  }

  private async waitForSuccessfulReceipt(
    transactionHash: string,
    params: ChainExecutorTransferParams<EvmAsset> | ChainExecutorApproveParams<EvmAsset>,
    operation: 'approve' | 'transfer',
  ) {
    const receipt = await waitForTransactionReceipt(this.client, { hash: transactionHash as `0x${string}` })
    if (receipt.status === 'reverted') {
      throw new ExecutorError('Transaction reverted', {
        code: 'transaction_reverted',
        operation,
        chain: 'eip155',
        chainId: params.asset.chain.id,
        assetAddress: params.asset.address,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        amount: params.amount,
        transactionHash,
      })
    }
    return receipt
  }

  private toExecutorError(
    cause: unknown,
    code: ExecutorErrorCode,
    params: ChainExecutorTransferParams<EvmAsset> | ChainExecutorApproveParams<EvmAsset>,
    operation: 'approve' | 'transfer',
    transactionHash?: string,
  ): ExecutorError {
    if (cause instanceof ExecutorError && cause.operation) {
      return cause
    }

    return new ExecutorError(
      operation === 'approve' ? 'Failed to approve token allowance' : 'Failed to transfer token',
      {
        cause,
        code: cause instanceof ExecutorError ? cause.code : code,
        operation,
        chain: 'eip155',
        chainId: params.asset.chain.id,
        assetAddress: params.asset.address,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        amount: params.amount,
        transactionHash,
      },
    )
  }
}
