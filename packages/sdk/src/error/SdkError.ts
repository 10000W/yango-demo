export class SdkError extends Error {
  readonly code: string
  readonly details?: Readonly<Record<string, unknown>>

  constructor(
    message: string,
    options: {
      cause?: unknown
      code?: string
      details?: Readonly<Record<string, unknown>>
    } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'SdkError'
    this.code = options.code ?? 'unknown'
    this.details = options.details
  }
}
