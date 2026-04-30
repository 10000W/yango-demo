import { createMemoryHistory, createRouter } from 'vue-router'
import SelectPaymentPage from '@ui/pages/SelectPaymentPage.vue'
import SelectAssetPage from '@ui/pages/SelectAssetPage.vue'
import PayPage from '@ui/pages/PayPage.vue'
import StatusPage from '@ui/pages/StatusPage.vue'
import EditConnectionsPage from '@ui/pages/EditConnectionsPage.vue'
import PromoPage from '@ui/pages/PromoPage.vue'
import WhitelistPage from '@ui/pages/WhitelistPage.vue'

export const createPaymentRouter = (base = '/') => createRouter({
  history: createMemoryHistory(),
  routes: [
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
  ],
})

const router = createPaymentRouter()
export default router
