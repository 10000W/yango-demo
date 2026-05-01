import { createApp } from 'vue'
import { createAppRouter } from './router'
import App from './App.vue'

export { default as BaseButton } from './components/base/BaseButton.vue'
export { default as BaseBottomSheet } from './components/base/BaseBottomSheet.vue'

export function mount(selector: string, options?: { onClose?: () => void }) {
  const app = createApp(App)
  const router = createAppRouter()
  app.use(router)

  if (options?.onClose) {
    app.provide('onClose', options.onClose)
  }

  const el = document.querySelector(selector)
  if (!el) return null

  app.mount(el)

  return app
}
