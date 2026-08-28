import type { RouteRecordRaw } from 'vue-router'
import YangoPayment from './YangoPayment.vue'
import type { PaymentSetup } from './types'
import { usePayment } from './usePayment'

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
      },
  children: [
    {
      path: '',
      name: 'payment.start',
      component: () => import('./pages/SelectPaymentPage.vue'),
      beforeEnter: () => {
        const { reset, selectedChain } = usePayment()
        if (!selectedChain.value) {
          reset()
        }
      },
    },
    {
      path: 'asset',
      name: 'payment.asset',
      component: () => import('./pages/SelectAssetPage.vue'),
      beforeEnter: (route) => {
        const { selectedPaymentOption } = usePayment()
        return selectedPaymentOption.value
          ? true
          : {
              name: 'payment.start',
              params: { productId: route.params.productId },
            }
      },
    },
    {
      path: 'pay/:sessionId?',
      name: 'payment.pay',
      component: () => import('./pages/PayPage.vue'),
      beforeEnter: (route) => {
        if (route.params.sessionId) {
          return true
        }

        const { selectedAsset, selectedChain, selectedPaymentOption } = usePayment()
        return selectedPaymentOption.value && selectedChain.value && selectedAsset.value
          ? true
          : {
              name: 'payment.start',
              params: { productId: route.params.productId },
            }
      },
    },
    {
      path: 'edit',
      name: 'payment.edit',
      component: () => import('./pages/EditConnectionsPage.vue'),
    },
    {
      path: 'status/:sessionId?',
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
