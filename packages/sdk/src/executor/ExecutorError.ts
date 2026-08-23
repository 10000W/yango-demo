import { SdkError } from '../SdkError'

export type ExecutorErrorCode
  = | 'unknown'
    | 'transfer_failed'
    | 'approve_failed'
    | 'invalid_asset'
    | 'invalid_amount'
    | 'client_error'
    | 'read_failed'
    | 'simulation_failed'
    | 'signing_failed'
    | 'broadcast_failed'
    | 'confirmation_failed'
    | 'transaction_reverted'

export type ExecutorOperation = 'approve' | 'transfer' | 'sign'
export type ExecutorChain = 'eip155' | 'tron'

export class ExecutorError extends SdkError {
  readonly code: ExecutorErrorCode
  readonly status?: number
  readonly retryable: boolean
  readonly operation?: ExecutorOperation
  readonly chain?: ExecutorChain
  readonly chainId?: number
  readonly assetAddress?: string
  readonly fromAddress?: string
  readonly toAddress?: string
  readonly amount?: string
  readonly transactionHash?: string

  constructor(
    message: string,
    options: {
      cause?: unknown
      code?: ExecutorErrorCode
      status?: number
      retryable?: boolean
      operation?: ExecutorOperation
      chain?: ExecutorChain
      chainId?: number
      assetAddress?: string
      fromAddress?: string
      toAddress?: string
      amount?: string
      transactionHash?: string
    } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'ExecutorError'
    this.code = options.code ?? 'unknown'
    this.status = options.status
    this.retryable = options.retryable ?? false
    this.operation = options.operation
    this.chain = options.chain
    this.chainId = options.chainId
    this.assetAddress = options.assetAddress
    this.fromAddress = options.fromAddress
    this.toAddress = options.toAddress
    this.amount = options.amount
    this.transactionHash = options.transactionHash
  }
}
