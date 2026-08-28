import type { RouteRecordRaw } from 'vue-router'
import YangoMandate from './YangoMandate.vue'
import type { MandateSetup } from './types'
import { useMandate } from './useMandate'

export const createMandateRoutes = (setup: MandateSetup = {}): RouteRecordRaw[] => [{
  path: '/mandate/:mandateId?',
  alias: '/setup/:mandateId?',
  name: 'mandate',
  component: YangoMandate,
  props: route => ({
    mandateId: route.params.mandateId as string | undefined,
    setup,
  }),
  beforeEnter: route => (route.params.mandateId || setup.mandateId)
    ? true
    : {
        name: 'error',
      },
  children: [
    {
      path: '',
      name: 'mandate.start',
      component: () => import('./pages/MainPage.vue'),
    },
    {
      path: 'connect',
      name: 'mandate.connect',
      component: () => import('./pages/ConnectWalletPage.vue'),
    },
    {
      path: 'asset',
      name: 'mandate.asset',
      component: () => import('./pages/SelectAssetPage.vue'),
      beforeEnter: (route) => {
        const { selectedPaymentOption } = useMandate()
        return selectedPaymentOption.value
          ? true
          : {
              name: 'mandate.start',
              params: { mandateId: route.params.mandateId },
            }
      },
    },
    {
      path: 'edit-allowance',
      name: 'mandate.edit-allowance',
      component: () => import('./pages/EditAllowancePage.vue'),
    },
    {
      path: 'status',
      name: 'mandate.status',
      component: () => import('./pages/StatusPage.vue'),
    },
    {
      // Keep initialization errors at the mandate root URL.
      path: '',
      name: 'mandate.error',
      component: () => import('./pages/ErrorPage.vue'),
    },
  ],
}]
