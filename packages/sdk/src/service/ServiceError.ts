export type ServiceErrorCode
  = | 'cancelled'
    | 'invalid_configuration'
    | 'rate_limited'
    | 'request_failed'

export class ServiceError extends Error {
  readonly code: ServiceErrorCode
  readonly status?: number
  readonly retryable: boolean

  constructor(
    message: string,
    options: {
      cause?: unknown
      code?: ServiceErrorCode
      status?: number
      retryable?: boolean
    } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'ServiceError'
    this.code = options.code ?? 'request_failed'
    this.status = options.status
    this.retryable = options.retryable ?? false
  }
}
