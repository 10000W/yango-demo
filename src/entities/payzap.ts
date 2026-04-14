import type { PaymentAsset, PaymentChainType } from '@/entities/payment'

export type PayZapSessionStatus = 'completed' | 'expired' | 'failed' | 'confirming' | 'pending'
export type PayZapSession = {
  id: string
  productId: string
  merchantWallet: string
  amount: string // float
  asset: PaymentAsset
  chain: PaymentChainType
  status: PayZapSessionStatus
  expiresAt: string // iso date
  paymentUrl?: string
  exchangePayUrl?: string
  exchangePayQr?: string
}
