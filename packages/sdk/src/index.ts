import { IService } from './service'
import {
  PayZapMandate,
  PayZapPayment,
  PayZapPaymentCreateConfig,
  PayZapService,
} from './adapters/payzap'
// import { Asset } from './asset'

export type TacPaymentService = 'payzap' | 'test'
export type TacPaymentConfig = {
  service?: TacPaymentService
  serviceParams?: {
    payzapUrl?: string
  }
}

export class TacPaymentSdk {
  private config: TacPaymentConfig
  service: IService

  constructor(config: TacPaymentConfig) {
    this.config = config

    if (config.service === 'payzap') {
      this.service = new PayZapService(config.serviceParams?.payzapUrl)
      return
    }
    throw new Error('Service is not supported')
  }

  getProduct(id: string) {
    return this.service.getProduct(id)
  }

  async getMandate(id: string) {
    if (this.service instanceof PayZapService) {
      const { data } = await this.service.getMandateSetup(id)
      return new PayZapMandate(this.service, data)
    }

    throw new Error('Service is not supported')
  }

  createPayment() {
    if (this.service instanceof PayZapService) {
      return (args: Omit<PayZapPaymentCreateConfig, 'payZapService'>) => {
        return PayZapPayment.create({
          ...args,
          payzapUrl: this.config.serviceParams?.payzapUrl,
          payZapService: this.service as PayZapService,
        })
      }
    }

    throw new Error('Service is not supported')
  }
}
