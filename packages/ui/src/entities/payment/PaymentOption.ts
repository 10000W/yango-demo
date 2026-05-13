export type PaymentOptionType = 'blockchain' | 'binance' | 'bybit' | 'yango'
export type PaymentOptionChainNamespace = 'ton' | 'tron' | 'eip155'
export type PaymentOptionChainType = 'evm' | 'tron' | 'ton' | 'binance_pay' | 'bybit_pay' | 'yango'

export type PaymentOptionBase = {
  name: string
  icon: string
  type: PaymentOptionType
  disabled?: boolean
  description?: string
  walletName?: string
  walletId?: string
}

export type PaymentOptionBlockchain = {
  type: 'blockchain'
  namespaces: PaymentOptionChainNamespace[]
} | {
  type: Exclude<PaymentOptionType, 'blockchain'>
  namespaces?: never
}

export type PaymentOption = PaymentOptionBase & PaymentOptionBlockchain
