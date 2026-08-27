import { PayZapPayment } from '@tac-crypto-payment/sdk'

export type PaymentConfig = {
  productId?: string
  skipSetup?: boolean
  payzapUrl?: string
  onClose?: () => void
  onSuccess?: (session: PayZapPayment) => void
}
