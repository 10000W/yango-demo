import binanceIcon from '../public/images/payment/binance.png?url'
import { evmPaymentOptions, PaymentOption } from '@tac-crypto-payment/runtime'

export const paymentOptions: PaymentOption[] = [
  {
    name: 'Binance',
    description: 'Crypto exchange (CEX)',
    type: 'binance',
    icon: binanceIcon,
  },
  ...evmPaymentOptions,
]
