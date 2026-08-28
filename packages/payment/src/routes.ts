import type { RouteRecordRaw } from 'vue-router'
import YangoPayment from './YangoPayment.vue'
import type { PaymentSetup } from './types'

export const createPaymentRoutes = (setup: PaymentSetup = {}): RouteRecordRaw[] => [{
  path: '/payment/:productId?',
  alias: '/pay/:productId?',
  name: 'payment',
  component: YangoPayment,
  props: route => ({
    productId: route.params.productId as string | undefined,
    setup,
  }),
  beforeEnter: route => (route.params.productId || setup.productId)
    ? true
    : {
        name: 'error',
        query: {
          title: 'Missing product ID',
          message: 'A product ID is required to start a payment.',
        },
      },
  children: [
    {
      path: '',
      name: 'payment.start',
      component: () => import('./pages/SelectPaymentPage.vue'),
    },
    {
      path: 'asset',
      name: 'payment.asset',
      component: () => import('./pages/SelectAssetPage.vue'),
    },
    {
      path: 'pay',
      name: 'payment.pay',
      component: () => import('./pages/PayPage.vue'),
    },
    {
      path: 'edit',
      name: 'payment.edit',
      component: () => import('./pages/EditConnectionsPage.vue'),
    },
    {
      path: 'status',
      name: 'payment.status',
      component: () => import('./pages/StatusPage.vue'),
    },
    {
      path: 'promo',
      name: 'payment.promo',
      component: () => import('./pages/PromoPage.vue'),
    },
    {
      path: 'whitelist',
      name: 'payment.whitelist',
      component: () => import('./pages/WhitelistPage.vue'),
    },
    {
      // Named so feature code can render it, but intentionally shares the
      // feature root URL instead of exposing an implementation route.
      path: '',
      name: 'payment.error',
      component: () => import('./pages/ErrorPage.vue'),
    },
  ],
}]
