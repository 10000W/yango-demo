import { PaymentOption } from '@/entities/payment/PaymentOption'

import binanceIcon from '@/assets/images/payment/binance.png'
import bybitIcon from '@/assets/images/payment/bybit.png'
import metamaskIcon from '@/assets/images/payment/metamask.png'
import trustIcon from '@/assets/images/payment/trust.png'
import yangoIcon from '@/assets/images/payment/yango.png'

export type PaymentAsset = 'USDT' | 'USDC' | 'DAI' | 'BUSD'
export type PaymentChainType = 'evm' | 'ton' | 'tron' | 'solana' | 'binance_pay' | 'bybit_pay' | 'yango'

export const paymentOptions = [
  new PaymentOption('Binance', 'Crypto exchange (CEX)', 'binance_pay', binanceIcon),
  new PaymentOption('ByBit', 'Crypto exchange (CEX)', 'bybit_pay', bybitIcon),
  new PaymentOption('MetaMask', 'Web3 Wallet', 'evm', metamaskIcon, 'metamask'),
  new PaymentOption('TrustWallet', 'Web3 Wallet', 'evm', trustIcon, 'trust'),
  // new PaymentOption('TronLink', 'Web3 Wallet', 'tron', '/icons/tronlink.svg'),
  // new PaymentOption('TON', 'Tonchain Wallet', 'ton', '/icons/ton.svg'),
  new PaymentOption('Other wallets', 'Choose other EVM wallet', 'evm', 'evm'),
  new PaymentOption('Yango card', 'Apply to waiting list', 'yango', yangoIcon),
]

export { PaymentOption }
