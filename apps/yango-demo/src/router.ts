import { createMemoryHistory, createRouter } from 'vue-router'
import { createMandateRoutes } from '@tac-crypto-payment/mandate'
import { createPaymentRoutes } from '@tac-crypto-payment/payment'

const payzapUrl = 'https://staging-api.payzap.cc'
let onClose: (() => void) | undefined

export const setDemoCloseHandler = (handler: () => void) => {
  onClose = handler
}

export const demoRouter = createRouter({
  history: createMemoryHistory(),
  routes: [
    ...createPaymentRoutes({
      payzapUrl,
      onClose: () => onClose?.(),
    }),
    ...createMandateRoutes({
      payzapUrl,
      onClose: () => onClose?.(),
    }),
    {
      path: '/test-mandate-session',
      name: 'test-mandate-session',
      component: () => import('./pages/MandateTestPage.vue'),
    },
    {
      path: '/error',
      name: 'error',
      component: {
        template: '<p>Unable to open payment flow.</p>',
      },
    },
  ],
})
