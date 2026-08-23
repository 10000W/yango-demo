import { createMemoryHistory, createRouter } from 'vue-router'
import SelectPaymentPage from '@/pages/SelectPaymentPage.vue'
import SelectAssetPage from '@/pages/SelectAssetPage.vue'
import PayPage from '@/pages/PayPage.vue'
import StatusPage from '@/pages/StatusPage.vue'
import EditConnectionsPage from '@/pages/EditConnectionsPage.vue'
import PromoPage from '@/pages/PromoPage.vue'
import WhitelistPage from '@/pages/WhitelistPage.vue'
import ErrorPage from '@/pages/ErrorPage.vue'
import TestConnectPage from '@/pages/TestConnectPage.vue'
import TestMandate from '@/pages/TestMandate.vue'
import MandateMainPage from '@/pages/mandate/MandateMainPage.vue'
import MandateConnectWalletPage from '@/pages/mandate/MandateConnectWalletPage.vue'
import MandateSelectAssetPage from '@/pages/mandate/MandateSelectAssetPage.vue'
import MandateEditAllowancePage from '@/pages/mandate/MandateEditAllowancePage.vue'
import MandateStatusPage from '@/pages/mandate/MandateStatusPage.vue'

export const createPaymentRouter = (base = '/') => createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      name: 'error',
      path: '/error',
      component: ErrorPage,
    },
    {
      name: '',
      path: '/',
      component: SelectPaymentPage,
    },
    {
      name: 'asset',
      path: '/asset',
      component: SelectAssetPage,
    },
    {
      name: 'pay',
      path: '/pay',
      component: PayPage,
    },
    {
      name: 'edit',
      path: '/edit',
      component: EditConnectionsPage,
    },
    {
      name: 'status',
      path: '/status',
      component: StatusPage,
    },
    {
      name: 'promo',
      path: '/promo',
      component: PromoPage,
    },
    {
      name: 'whitelist',
      path: '/whitelist',
      component: WhitelistPage,
    },
    {
      name: 'test',
      path: '/test',
      component: TestConnectPage,
    },
    {
      name: 'test-mandate-session',
      path: '/test-mandate',
      component: TestMandate,
    },
    {
      path: '/:pathMatch(.*)*',
      component: ErrorPage,
      props: {
        title: '404 Not Found',
        message: 'The page you are looking for does not exist.',
      },
    },
  ],
})
export const createMandateRouter = (base = '/mandate') => createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      name: 'error',
      path: '/error',
      component: ErrorPage,
    },
    {
      name: '',
      path: '/',
      component: MandateMainPage,
    },
    {
      name: 'connect',
      path: '/connect',
      component: MandateConnectWalletPage,
    },
    {
      name: 'asset',
      path: '/asset',
      component: MandateSelectAssetPage,
    },
    {
      name: 'status',
      path: '/status',
      component: MandateStatusPage,
    },
    {
      name: 'edit-allowance',
      path: '/edit-allowance',
      component: MandateEditAllowancePage,
    },
  ],
})
