import binanceIcon from '@/assets/images/payment/binance.png'
import bybitIcon from '@/assets/images/payment/bybit.png'
import metamaskIcon from '@/assets/images/payment/metamask.png'
import trustIcon from '@/assets/images/payment/trust.png'
import yangoIcon from '@/assets/images/payment/yango.png'
import {
  PaymentOption,
  PaymentOptionChainNamespace,
  PaymentOptionChainType,
  PaymentOptionType,
} from '@/entities/payment/PaymentOption'

export const evmPaymentOptions: PaymentOption[] = [
  {
    name: 'MetaMask',
    description: 'Web3 Wallet',
    type: 'blockchain',
    namespaces: ['eip155', 'tron'],
    icon: metamaskIcon,
    walletName: 'metamask',
    walletId: 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
  },
  {
    name: 'TrustWallet',
    description: 'Web3 Wallet',
    type: 'blockchain',
    namespaces: ['eip155', 'tron'],
    icon: trustIcon,
    walletName: 'trust',
    walletId: '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
  },
  {
    name: 'Other wallets',
    description: 'Choose other EVM wallet',
    type: 'blockchain',
    namespaces: ['eip155', 'tron'],
    icon: 'evm',
  },
]
export const paymentOptions: PaymentOption[] = [
  {
    name: 'Binance',
    description: 'Crypto exchange (CEX)',
    type: 'binance',
    icon: binanceIcon,
  },
  {
    name: 'ByBit',
    description: 'Crypto exchange (CEX)',
    type: 'bybit',
    icon: bybitIcon,
  },
  ...evmPaymentOptions,
  {
    name: 'Yango',
    description: 'Apply to waiting list',
    type: 'yango',
    icon: yangoIcon,
  },
]
export type { PaymentOptionType, PaymentOption, PaymentOptionChainNamespace, PaymentOptionChainType }
