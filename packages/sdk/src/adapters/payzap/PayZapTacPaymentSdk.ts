import { TacPaymentSdk } from '../../sdk'
import { PayZapMandate } from './PayZapMandate'
import { PayZapPayment, type PayZapPaymentCreateConfig } from './PayZapPayment'
import { PayZapService } from './PayZapService'

export type PayZapPaymentOptions = Omit<PayZapPaymentCreateConfig, 'payZapService' | 'payzapUrl'>

export class PayZapTacPaymentSdk extends TacPaymentSdk<PayZapService> {
  constructor(baseUrl?: string) {
    super({ service: new PayZapService(baseUrl) })
  }

  createPayment(options: PayZapPaymentOptions): Promise<PayZapPayment> {
    return PayZapPayment.create({ ...options, payZapService: this.service })
  }

  getMandate(id: string): Promise<PayZapMandate> {
    return PayZapMandate.create({ id, payZapService: this.service })
  }
}
