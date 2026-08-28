import { createApp } from 'vue'
import App from './App.vue'
import { demoRouter } from './router'
import '@tac-crypto-payment/ui/style.css'
import '@tac-crypto-payment/ui/main.scss'
import '@tac-crypto-payment/runtime/style.css'
import '@tac-crypto-payment/payment/style.css'
import '@tac-crypto-payment/mandate/style.css'

const app = createApp(App)
app.use(demoRouter)
app.mount('#app')
