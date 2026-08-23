import { SdkError } from '../SdkError'

export type PaymentErrorCode
  = | 'unknown'
    | 'invalid_argument'
    | 'invalid_state'
    | 'session_creation_failed'
    | 'session_refresh_failed'
    | 'session_mismatch'
    | 'sponsorship_failed'
    | 'permit_failed'
    | 'transfer_failed'
    | 'unsupported_executor'
    | 'cancelled'

export class PaymentError extends SdkError {
  readonly code: PaymentErrorCode
  readonly retryable: boolean
  readonly status?: number

  constructor(
    message: string,
    options: {
      cause?: unknown
      code?: PaymentErrorCode
      retryable?: boolean
      status?: number
    } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'PaymentError'
    this.code = options.code ?? 'unknown'
    this.retryable = options.retryable ?? false
    this.status = options.status
  }
}
