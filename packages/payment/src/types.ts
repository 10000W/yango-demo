import type { PayZapPayment } from '@tac-crypto-payment/sdk'

export type PaymentSetup = {
  productId?: string
  payzapUrl?: string
  skipSetup?: boolean
  onClose?: () => void
  onSuccess?: (session: PayZapPayment) => void
}

export type PaymentConfig = PaymentSetup & { flow: 'payment', productId: string }
