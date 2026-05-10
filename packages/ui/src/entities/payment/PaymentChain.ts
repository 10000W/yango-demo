export type PaymentChainPayContext<TAsset> = {
  asset: TAsset
  amount: bigint
  userAddress: string
  merchantAddress: string
}
export type PaymentChainPayOptions = {
  onUpdateStatus?: (status: string) => void
}
export const defaultPaymentChainPayOptions = {
  onUpdateStatus: () => {},
}
