import { PaymentOption } from '@/entities/payment/PaymentOption'

export type PaymentAsset = 'USDT' | 'USDC' | 'DAI' | 'BUSD'
export type PaymentChainType = 'evm' | 'ton' | 'tron' | 'solana' | 'binance_pay' | 'bybit_pay' | 'yango'

export const paymentOptions = [
  new PaymentOption('Binance', 'Crypto exchange (CEX)', 'binance_pay', '/icons/binance.png'),
  new PaymentOption('ByBit', 'Crypto exchange (CEX)', 'bybit_pay', '/icons/bybit.png'),
  new PaymentOption('MetaMask', 'Web3 Wallet', 'evm', '/icons/metamask.png', 'metamask'),
  new PaymentOption('TrustWallet', 'Web3 Wallet', 'evm', '/icons/trust.png', 'trust'),
  // new PaymentOption('TronLink', 'Web3 Wallet', 'tron', '/icons/tronlink.svg'),
  // new PaymentOption('TON', 'Tonchain Wallet', 'ton', '/icons/ton.svg'),
  new PaymentOption('Other wallets', 'Choose other EVM wallet', 'evm', 'evm'),
  new PaymentOption('Yango card', 'Apply to waiting list', 'yango', '/icons/yango.png'),
]

export { PaymentOption }
