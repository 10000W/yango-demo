import binanceIcon from '@/public/images/payment/binance.png?no-inline'
import bybitIcon from '@/public/images/payment/bybit.png?no-inline'
import metamaskIcon from '@/public/images/payment/metamask.png?no-inline'
import trustIcon from '@/public/images/payment/trust.png?no-inline'
import yangoIcon from '@/public/images/payment/yango.png?no-inline'
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
