import type { RouteRecordRaw } from 'vue-router'
import YangoMandate from './YangoMandate.vue'
import type { MandateSetup } from './types'

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
        query: { title: 'Missing mandate ID', message: 'A mandate ID is required to continue.' },
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
