import { createApp, type App } from 'vue'
import { createAppRouter } from './router'
import AppRoot from './App.vue'
import type { PayZapSession } from './entities/payzap'

export interface TacCryptoPaymentOptions {
  productId: string
  payzapUrl?: string
  amount: number | string
  elementSelector: string
  onClose?: () => void
  onSuccess?: (session: PayZapSession) => void
}

export class TacCryptoPayment {
  private app: App | null = null

  constructor(private options: TacCryptoPaymentOptions) {}

  private init() {
    this.options.payzapUrl = this.options.payzapUrl || 'https://api.payzap.cc'
  }

  mount() {
    this.init()
    this.app = createApp(AppRoot)
    const router = createAppRouter()
    this.app.use(router)

    this.app.provide('tacPaymentOptions', this.options)

    const el = document.querySelector(this.options.elementSelector)
    if (!el) {
      console.error(`Element ${this.options.elementSelector} not found`)
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
