import { createApp } from 'vue'
import App from './App.vue'
import { createAppRouter } from '@/router'
import '@tac-crypto-payment/ui/style.css'
import '@tac-crypto-payment/ui/main.scss'

const app = createApp(App)
app.use(createAppRouter())
app.provide('tacPaymentUiConfig', {
  payzapUrl: 'https://staging-api.payzap.cc',
})
app.mount('#app')
