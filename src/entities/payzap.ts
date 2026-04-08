import type { PaymentAsset, PaymentChainType } from '@/entities/payment'

export type PayZapSession = {
  id: string
  productId: string
  merchantWallet: string
  amount: string // float
  asset: PaymentAsset
  chain: PaymentChainType
  status: string
  expiresAt: string // iso date
  paymentUrl: string
}
