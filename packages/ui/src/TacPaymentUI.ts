import { createApp, type App } from 'vue'
import { createPaymentRouter, createMandateRouter } from './router'
import AppRoot from './App.vue'
import { PayZapPayment } from '@tac-crypto-payment/sdk'

export interface TacPaymentUIBaseConfig {
  flow: 'payment' | 'mandate'
  payzapUrl?: string
  elementSelector: string
  onClose?: () => void
}

export interface TacPaymentUIPaymentConfig extends TacPaymentUIBaseConfig {
  flow: 'payment'
  productId: string
  onSuccess?: (session: PayZapPayment) => void
}

export interface TacPaymentUIMandateConfig extends TacPaymentUIBaseConfig {
  flow: 'mandate'
  mandateId: string
}

export type TacPaymentUIConfig = TacPaymentUIPaymentConfig | TacPaymentUIMandateConfig

export class TacPaymentUI {
  private app: App | null = null

  constructor(private config: TacPaymentUIConfig) {}

  private init() {
    this.config.payzapUrl = this.config.payzapUrl || 'https://api.payzap.cc'
  }

  mount() {
    this.init()
    this.app = createApp(AppRoot)
    let router
    if (this.config.flow === 'mandate') {
      router = createMandateRouter()
    }
    else {
      router = createPaymentRouter()
    }
    this.app.use(router)
    this.app.provide('tacPaymentUiConfig', this.config)

    const el = document.querySelector(this.config.elementSelector)
    if (!el) {
      console.error(`Element ${this.config.elementSelector} not found`)
      return null
    }

    this.app.mount(el)

    return this.app
  }

  unmount() {
    if (this.app) {
      this.app.unmount()
      this.app = null
    }
  }
}
