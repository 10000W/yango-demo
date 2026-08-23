export type SdkErrorCode = 'unsupported_chain'

export class SdkError extends Error {
  readonly code: SdkErrorCode
  readonly details?: Readonly<Record<string, unknown>>

  constructor(
    message: string,
    options: {
      cause?: unknown
      code?: SdkErrorCode
      details?: Readonly<Record<string, unknown>>
    } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'SdkError'
    this.code = options.code ?? 'unsupported_chain'
    this.details = options.details
  }
}
