export type PaymentState
  = 'idle'
    | 'paying'
    | 'confirming'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'expired'

export interface IPayment {
  state: PaymentState

  validateState(): void
  pay(params: unknown): Promise<unknown>
  cancel(): void
}
