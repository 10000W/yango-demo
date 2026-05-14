import axios from 'axios'

export const payzapGasslessChains = ['polygon', 'bsc', 'arbitrum', 'base', 'tron', 'solana'] as const
export const payzapEvmNetworks = ['ethereum', 'base', 'arbitrum', 'polygon', 'bsc'] as const
export type PayZapFeeMode = 'absorb' | 'passthrough' | 'fixed'
export type PayZapFeePayer = 'buyer' | 'merchant'
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
  gasless: boolean
}

export type PayZapProduct = {
  id: string
  name: string
  description: null
  priceAmount: string
  priceCurrency: string
  availableChains: PayZapSessionChain[]
  availableMethods: {
    id: PayZapSessionChain
    type: string
    label: string
    color: string
  }[]
  evmNetworks: (typeof payzapEvmNetworks)[number][]
  gasless: {
    enabled: boolean
    networks: (typeof payzapGasslessChains)[number][]
    feeMode: PayZapFeeMode
    payer: PayZapFeePayer
  }
  tip: null
}
