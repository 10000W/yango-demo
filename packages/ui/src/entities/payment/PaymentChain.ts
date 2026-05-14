export type PaymentChainPayContext<TAsset> = {
  asset: TAsset
  amount: bigint
  gasless: boolean
  sessionId: string
  userAddress: string
  merchantAddress: string
}
export type PaymentChainPayOptions = {
  onUpdateStatus?: (status: string) => void
}
export const defaultPaymentChainPayOptions = {
  onUpdateStatus: () => {},
}

export abstract class PaymentChain<TAsset> {
  abstract pay(context: PaymentChainPayContext<TAsset>, options: PaymentChainPayOptions): Promise<void>
}
