import { SdkError } from '../SdkError'

export type MandateErrorCode
  = 'setup_failed' | 'approve_failed' | 'request_failed' | 'invalid_id'

export class MandateError extends SdkError {
  readonly code: MandateErrorCode
  readonly status?: number

  constructor(
    message: string,
    options: {
      cause?: unknown
      code?: MandateErrorCode
      status?: number
      retryable?: boolean
    } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'MandateError'
    this.code = options.code ?? 'request_failed'
    this.status = options.status
  }
}
