import { TronWeb } from 'tronweb'
import { TronConnector } from '@reown/appkit-adapter-tron'
import { Types } from 'tronweb'
import {
  ChainExecutorApproveParams,
  ChainExecutorTransferParams,
  IChainExecutor,
  ExecutorEvent,
  ExecutorError,
  ExecutorErrorCode,
} from '../executor'
import { maxUint256, parseUnits } from 'viem'
import { TronAsset } from '../asset/tron'

const trc20Abi = [
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: 'success', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: 'success', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export class TronExecutor implements IChainExecutor<TronAsset> {
  type = 'tron'
  connector: TronConnector
  private readonly _tronWeb: TronWeb

  constructor(connector: TronConnector) {
    this.connector = connector
    this._tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
    })
  }

  get tronWeb(): TronWeb {
    return this._tronWeb
  }

  validateAsset(asset: TronAsset) {
    if (!asset?.address) {
      throw new ExecutorError('Asset does not have an address', {
        code: 'invalid_asset',
        chain: 'tron',
        chainId: asset?.chain?.id,
        assetAddress: asset?.address,
      })
    }

    if (!Number.isInteger(asset.decimals) || asset.decimals < 0) {
      throw new ExecutorError('Asset does not have valid decimals', {
        code: 'invalid_asset',
        chain: 'tron',
        chainId: asset.chain.id,
        assetAddress: asset.address,
      })
    }
  }

  async approve(params: ChainExecutorApproveParams<TronAsset>, onUpdate?: (event: ExecutorEvent) => void) {
    const { asset, amount, fromAddress, toAddress } = params
    let transactionHash: string | undefined
    let errorCode: ExecutorErrorCode = 'invalid_amount'

    try {
      this.validateAsset(asset)
      const parsedAmount = amount === 'infinite' ? maxUint256 : parseUnits(amount, asset.decimals)
      onUpdate?.({ type: 'approval:preparing' })
      this.tronWeb.setAddress(fromAddress)
      const contract = this.tronWeb.contract(trc20Abi, asset.address)

      errorCode = 'read_failed'
      const allowance = await contract.allowance(fromAddress, toAddress).call()
      await new Promise(resolve => setTimeout(resolve, 1000))
      const allowanceValue = BigInt(allowance.toString())

      if (allowanceValue >= parsedAmount) {
        onUpdate?.({ type: 'approval:completed' })
        return
      }

      errorCode = 'signing_failed'
      onUpdate?.({ type: 'approval:signing' })
      const tx = await this.tronWeb.transactionBuilder.triggerSmartContract(
        asset.address,
        'approve(address,uint256)',
        {
          feeLimit: 100_000_000,
        },
        [
          { type: 'address', value: toAddress },
          { type: 'uint256', value: parsedAmount.toString() },
        ],
        fromAddress,
      )
      await new Promise(resolve => setTimeout(resolve, 1000))
      errorCode = 'broadcast_failed'
      transactionHash = await this._sendTransaction(tx)
      await new Promise(resolve => setTimeout(resolve, 1000))

      errorCode = 'confirmation_failed'
      onUpdate?.({ type: 'approval:confirming' })
      await this.waitForTransaction(transactionHash, params, 'approve')
      onUpdate?.({ type: 'approval:completed' })
      return transactionHash
    }
    catch (cause) {
      const error = this.toExecutorError(cause, errorCode, params, 'approve', transactionHash)
      onUpdate?.({ type: 'failed', error })
      throw error
    }
  }

  async transfer(params: ChainExecutorTransferParams<TronAsset>, onUpdate?: (event: ExecutorEvent) => void) {
    const { asset, amount, fromAddress, toAddress } = params
    let transactionHash: string | undefined
    let errorCode: ExecutorErrorCode = 'invalid_amount'

    try {
      this.validateAsset(asset)
      const parsedAmount = parseUnits(amount, asset.decimals)
      this.tronWeb.setAddress(fromAddress)
      onUpdate?.({ type: 'transfer:preparing' })
      errorCode = 'signing_failed'
      const tx = await this.tronWeb.transactionBuilder.triggerSmartContract(
        asset.address,
        'transfer(address,uint256)',
        {
          feeLimit: 100_000_000,
        },
        [
          { type: 'address', value: toAddress },
          { type: 'uint256', value: parsedAmount.toString() },
        ],
        fromAddress,
      )
      await new Promise(resolve => setTimeout(resolve, 1000))

      errorCode = 'broadcast_failed'
      transactionHash = await this._sendTransaction(tx)

      errorCode = 'confirmation_failed'
      onUpdate?.({ type: 'transfer:confirming' })
      await this.waitForTransaction(transactionHash, params, 'transfer')
      onUpdate?.({ type: 'transfer:completed' })
      return transactionHash
    }
    catch (cause) {
      const error = this.toExecutorError(cause, errorCode, params, 'transfer', transactionHash)
      onUpdate?.({ type: 'failed', error })
      throw error
    }
  }

  private async _sendTransaction(txWrapper: Types.TransactionWrapper) {
    if (!txWrapper.transaction?.raw_data?.contract?.[0]?.parameter?.value?.data) {
      throw new ExecutorError('Failed to extract transaction data', { code: 'broadcast_failed' })
    }

    const isWalletConnect = this.connector.type === 'WALLET_CONNECT' || this.connector.id === 'walletConnect'

    // FIXME: wait for appkit-adapter-tron update
    // internalRequest does not exist in TronWalletConnectConnector
    const connectorHack = this.connector as unknown as {
      internalRequest?: (args: unknown) => Promise<unknown>
      provider: {
        request: (args: unknown, networkId?: string) => Promise<unknown>
      }
      chains?: { caipNetworkId: string }[]
    }
    if (isWalletConnect && !connectorHack.internalRequest) {
      connectorHack.internalRequest = (args: unknown) => {
        return connectorHack.provider.request(args, connectorHack.chains?.[0]?.caipNetworkId)
      }
    }

    const method = isWalletConnect ? 'tron_signTransaction' : 'tron_sendTransaction'

    const response = await this.connector.request({
      method,
      params: { address: this.tronWeb.defaultAddress.base58, transaction: txWrapper.transaction },
    })

    if (typeof response === 'string') {
      return response
    }

    const result = await this.tronWeb.trx.sendRawTransaction(response as Types.SignedTransaction)
    if (!result.result) {
      throw new ExecutorError(result.message || 'Failed to broadcast transaction', {
        code: 'broadcast_failed',
      })
    }
    return result.txid
  }

  private async waitForTransaction(
    hash: string,
    params: ChainExecutorTransferParams<TronAsset> | ChainExecutorApproveParams<TronAsset>,
    operation: 'approve' | 'transfer',
  ) {
    // FIXME: use tronweb or new adapter for receipt waiting
    while (true) {
      const info = await this.tronWeb.trx.getTransactionInfo(hash)
      if (info && info.id) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (info.receipt?.result === 'SUCCESS' || info.result === 'SUCCESS') {
          return true
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (info.result && info.result !== 'SUCCESS') {
          throw new ExecutorError(`Transaction failed: ${info.result}`, {
            code: 'transaction_reverted',
            operation,
            chain: 'tron',
            chainId: params.asset.chain.id,
            assetAddress: params.asset.address,
            fromAddress: params.fromAddress,
            toAddress: params.toAddress,
            amount: params.amount,
            transactionHash: hash,
          })
        }
      }
      await new Promise(resolve => setTimeout(resolve, 4000))
    }
  }

  private toExecutorError(
    cause: unknown,
    code: ExecutorErrorCode,
    params: ChainExecutorTransferParams<TronAsset> | ChainExecutorApproveParams<TronAsset>,
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
        chain: 'tron',
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
