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

const WALLET_BROADCAST_TIMEOUT_MS = 30_000
const WALLET_BROADCAST_POLL_INTERVAL_MS = 3_000

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
    const { asset, amount, fromAddress, toAddress, force } = params
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
      const allowanceValue = BigInt(allowance.toString())

      if (allowanceValue >= parsedAmount && !force) {
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
      errorCode = 'broadcast_failed'
      transactionHash = await this._sendTransaction(tx)

      errorCode = 'confirmation_failed'
      onUpdate?.({ type: 'approval:confirming' })
      await this.waitForTransaction(transactionHash, params, 'approve')
      onUpdate?.({ type: 'approval:completed' })
      return transactionHash
    }
    catch (cause) {
      const error = this.toExecutorError(cause, errorCode, params, 'approve', transactionHash)
      onUpdate?.({ type: 'approval:failed', error })
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
      errorCode = 'broadcast_failed'
      transactionHash = await this._sendTransaction(tx)

      errorCode = 'confirmation_failed'
      onUpdate?.({ type: 'transfer:confirming' })
      await this.waitForTransaction(transactionHash, params, 'transfer')
      onUpdate?.({ type: 'transfer:completed' })
      return transactionHash
    }
    catch (cause) {
      console.warn(cause)
      const error = this.toExecutorError(cause, errorCode, params, 'transfer', transactionHash)
      onUpdate?.({ type: 'transfer:failed', error })
      throw error
    }
  }

  private async _sendTransaction(txWrapper: Types.TransactionWrapper) {
    const unsignedTransaction = txWrapper.transaction
    if (!unsignedTransaction?.raw_data?.contract?.[0]?.parameter?.value?.data) {
      throw new ExecutorError('Failed to build transaction', { code: 'broadcast_failed' })
    }

    const isWalletConnect = this.connector.type === 'WALLET_CONNECT' || this.connector.id === 'walletConnect'

    // FIXME: wait for appkit-adapter-tron update
    // internalRequest does not exist in TronWalletConnectConnector
    const connectorHack = this.connector as unknown as {
      internalRequest?: (args: unknown) => Promise<unknown>
      provider: {
        request: (args: unknown, networkId?: string) => Promise<unknown>
        session?: {
          sessionProperties?: Record<string, unknown>
        }
      }
      chains?: { caipNetworkId: string }[]
    }
    if (isWalletConnect && !connectorHack.internalRequest) {
      connectorHack.internalRequest = (args: unknown) => {
        return connectorHack.provider.request(args, 'tron:0x2b6653dc')
      }
    }

    const method = isWalletConnect ? 'tron_signTransaction' : 'tron_sendTransaction'
    // WalletConnect negotiates the Tron RPC parameter shape per session. The
    // legacy v1 format receives the raw transaction; v2 wraps it once.
    const usesWalletConnectV1 = connectorHack.provider.session?.sessionProperties?.tron_method_version === 'v1'

    const response = await this.connector.request({
      method,
      params: {
        address: this.tronWeb.defaultAddress.hex,
        transaction: isWalletConnect && !usesWalletConnectV1
          ? { transaction: unsignedTransaction }
          : unsignedTransaction,
      },
    })

    if (typeof response === 'string') {
      if (isWalletConnect) {
        await this.waitForWalletBroadcast(response)
      }
      return response
    }

    // Reown providers may wrap their payload in `result`.
    const walletResponse = response as { result?: unknown }
    const signedTransaction = (walletResponse.result ?? walletResponse) as Partial<Types.SignedTransaction>
    const signature = signedTransaction.signature
    const claimedTransactionHash = this.getTransactionHash(signedTransaction)

    if (signature) {
      // Always broadcast signed data ourselves. This is safe if the wallet
      // already broadcast it, and prevents a claimed-but-unsent transaction.
      const transactionToBroadcast = signedTransaction.raw_data
        ? signedTransaction
        : { ...unsignedTransaction, signature: this.normalizeSignatures(signature) }
      const result = await this.tronWeb.trx.sendRawTransaction(transactionToBroadcast as Types.SignedTransaction)
      if (!result.result) {
        throw new ExecutorError(result.message || 'Failed to broadcast transaction', {
          code: 'broadcast_failed',
        })
      }
      return result.txid
    }

    if (claimedTransactionHash) {
      // Some WalletConnect wallets return a txID without signature data. Check
      // that it was actually accepted instead of waiting indefinitely.
      await this.waitForWalletBroadcast(claimedTransactionHash)
      return claimedTransactionHash
    }

    throw new ExecutorError('Wallet returned an unsigned transaction response', { code: 'broadcast_failed' })
  }

  private getTransactionHash(transaction: Partial<Types.SignedTransaction>): string | undefined {
    const response = transaction as { txID?: unknown, txid?: unknown }
    if (typeof response.txID === 'string') return response.txID
    if (typeof response.txid === 'string') return response.txid
  }

  private normalizeSignatures(signature: Types.SignedTransaction['signature']): string[] {
    const normalized = (Array.isArray(signature) ? signature : [signature])
      .filter((value): value is string => typeof value === 'string')
      .map(value => value.replace(/^0x/, ''))

    if (!normalized.length) {
      throw new ExecutorError('Wallet returned an invalid transaction signature', { code: 'broadcast_failed' })
    }
    return normalized
  }

  private async waitForWalletBroadcast(hash: string) {
    const deadline = Date.now() + WALLET_BROADCAST_TIMEOUT_MS
    while (Date.now() < deadline) {
      try {
        const transaction = await this.tronWeb.trx.getTransaction(hash)
        if (transaction && Object.keys(transaction).length) return
      }
      catch {
        // Nodes can briefly return an error before an accepted transaction is indexed.
      }
      await new Promise(resolve => setTimeout(resolve, WALLET_BROADCAST_POLL_INTERVAL_MS))
    }

    throw new ExecutorError(
      'Wallet did not broadcast the transaction. Please try again or use a different wallet.',
      { code: 'broadcast_failed' },
    )
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
