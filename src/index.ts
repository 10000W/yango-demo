import { createApp } from 'vue'
import Main from './Main.vue'
import { createPaymentRouter } from './router'

export function mount(selector: string, options?: { onClose?: () => void }) {
  const app = createApp(Main)
  const router = createPaymentRouter()
  app.use(router)

  if (options?.onClose) {
    app.provide('onClose', options.onClose)
  }

  const el = document.querySelector(selector)
  if (!el) return null

  app.mount(el)

  // Push initial route
  // router.replace({ name: 'index' })

  return app
}
