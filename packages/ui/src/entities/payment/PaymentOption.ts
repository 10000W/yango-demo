export type PaymentOptionChainType = 'evm' | 'ton' | 'tron' | 'solana' | 'binance_pay' | 'bybit_pay' | 'yango'

export type PaymentOption = {
  name: string
  icon: string
  type: PaymentOptionChainType
  disabled?: boolean
  description?: string
  walletName?: string
}
