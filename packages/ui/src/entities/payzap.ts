import type { PaymentOptionChainType } from '@/entities/payment'

export type PayZapSessionStatus = 'completed' | 'expired' | 'failed' | 'confirming' | 'pending'
export type PayZapSession = {
  id: string
  productId: string
  merchantWallet: string
  amount: string // float
  asset: 'USDT'
  chain: PaymentOptionChainType
  status: PayZapSessionStatus
  expiresAt: string // iso date
  paymentUrl?: string
  exchangePayUrl?: string
  exchangePayQr?: string
}
