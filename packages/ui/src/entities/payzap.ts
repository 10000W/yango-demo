export type PayZapSessionStatus = 'completed' | 'expired' | 'failed' | 'confirming' | 'pending'
export type PayZapSessionChain = 'evm' | 'ton' | 'tron' | 'solana' | 'binance_pay' | 'bybit_pay'
export type PayZapSession = {
  id: string
  productId: string
  merchantWallet: string
  amount: string // float
  asset: 'USDT'
  chain: PayZapSessionChain
  status: PayZapSessionStatus
  expiresAt: string // iso date
  paymentUrl?: string
  exchangePayUrl?: string
  exchangePayQr?: string
}
