import type { NavigationGuard, RouteRecordRaw } from 'vue-router'
import YangoMandate from './YangoMandate.vue'
import type { MandateSetup } from './types'
import { useMandate } from './useMandate'

const redirectExpiredOrRevokedMandate: NavigationGuard = (route) => {
  const { isExpiredOrRevoked } = useMandate()

  return isExpiredOrRevoked.value
    ? {
        name: 'mandate.start',
        params: { mandateId: route.params.mandateId },
      }
    : true
}

const redirectPendingMandate: NavigationGuard = (route) => {
  const { status } = useMandate()

  return status.value === 'pending'
    ? {
        name: 'mandate.select',
        params: { mandateId: route.params.mandateId },
      }
    : true
}

export const createMandateRoutes = (setup: MandateSetup = {}): RouteRecordRaw[] => [{
  path: '/riders/:mandateId?',
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
      beforeEnter: redirectPendingMandate,
    },
    {
      path: 'select',
      name: 'mandate.select',
      component: () => import('./pages/SelectPaymentOptionPage.vue'),
      beforeEnter: redirectExpiredOrRevokedMandate,
    },
    {
      path: 'methods/:methodId/edit',
      name: 'mandate.method.edit',
      component: () => import('./pages/EditMethodPage.vue'),
      beforeEnter: redirectExpiredOrRevokedMandate,
    },
    {
      path: 'connect',
      name: 'mandate.connect',
      component: () => import('./pages/ConnectWalletPage.vue'),
      beforeEnter: redirectExpiredOrRevokedMandate,
    },
    {
      path: 'asset',
      name: 'mandate.asset',
      component: () => import('./pages/SelectAssetPage.vue'),
      beforeEnter: (route) => {
        const { selectedPaymentOption, isExpiredOrRevoked } = useMandate()
        if (isExpiredOrRevoked.value || !selectedPaymentOption.value) {
          return {
            name: 'mandate.start',
            params: { mandateId: route.params.mandateId },
          }
        }

        return true
      },
    },
    {
      path: 'edit-allowance',
      name: 'mandate.edit-allowance',
      component: () => import('./pages/EditAllowancePage.vue'),
      beforeEnter: redirectExpiredOrRevokedMandate,
    },
    {
      path: 'status',
      name: 'mandate.status',
      component: () => import('./pages/StatusPage.vue'),
      beforeEnter: redirectExpiredOrRevokedMandate,
    },
    {
      name: 'mandate.binance.form',
      path: 'binance/form',
      component: () => import('./pages/binance/FormPage.vue'),
      beforeEnter: redirectExpiredOrRevokedMandate,
    },
    {
      name: 'mandate.binance.confirm',
      path: 'binance/confirm',
      component: () => import('./pages/binance/ConfirmPage.vue'),
      beforeEnter: redirectExpiredOrRevokedMandate,
    },
    {
      // Keep initialization errors at the mandate root URL.
      path: '',
      name: 'mandate.error',
      component: () => import('./pages/ErrorPage.vue'),
    },
  ],
}]
