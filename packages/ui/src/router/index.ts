import { createMemoryHistory, createRouter } from 'vue-router'
import SelectPaymentPage from '@/pages/SelectPaymentPage.vue'
import SelectAssetPage from '@/pages/SelectAssetPage.vue'
import PayPage from '@/pages/PayPage.vue'
import StatusPage from '@/pages/StatusPage.vue'
import EditConnectionsPage from '@/pages/EditConnectionsPage.vue'
import PromoPage from '@/pages/PromoPage.vue'
import WhitelistPage from '@/pages/WhitelistPage.vue'
import ErrorPage from '@/pages/ErrorPage.vue'

export const createAppRouter = (base = '/') => createRouter({
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
      path: '/:pathMatch(.*)*',
      component: ErrorPage,
      props: {
        title: '404 Not Found',
        message: 'The page you are looking for does not exist.',
      },
    },
  ],
})
