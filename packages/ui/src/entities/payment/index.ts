import binanceIcon from '@/assets/images/payment/binance.png'
import bybitIcon from '@/assets/images/payment/bybit.png'
import metamaskIcon from '@/assets/images/payment/metamask.png'
import trustIcon from '@/assets/images/payment/trust.png'
import yangoIcon from '@/assets/images/payment/yango.png'
import { PaymentOption, PaymentOptionChainType } from '@/entities/payment/PaymentOption'

export const paymentOptions: PaymentOption[] = [
  {
    name: 'Binance',
    description: 'Crypto exchange (CEX)',
    type: 'binance_pay',
    icon: binanceIcon,
  },
  {
    name: 'ByBit',
    description: 'Crypto exchange (CEX)',
    type: 'bybit_pay',
    icon: bybitIcon,
  },
  {
    name: 'MetaMask',
    description: 'Web3 Wallet',
    type: 'evm',
    icon: metamaskIcon,
    walletName: 'metamask',
  },
  {
    name: 'TrustWallet',
    description: 'Web3 Wallet',
    type: 'evm',
    icon: trustIcon,
    walletName: 'trust',
  },
  // new PaymentOption('TronLink', 'Web3 Wallet', 'tron', '/icons/tronlink.svg'),
  // new PaymentOption('TON', 'Tonchain Wallet', 'ton', '/icons/ton.svg'),
  {
    name: 'Other wallets',
    description: 'Choose other EVM wallet',
    type: 'evm',
    icon: 'evm',
  },
  {
    name: 'Yango',
    description: 'Apply to waiting list',
    type: 'yango',
    icon: yangoIcon,
  },
]
export type { PaymentOptionChainType, PaymentOption }
