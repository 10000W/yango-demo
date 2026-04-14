import { createMemoryHistory, createRouter, createWebHashHistory } from 'vue-router'
import SelectPaymentPage from '@/pages/SelectPaymentPage.vue'
import SelectAssetPage from '@/pages/SelectAssetPage.vue'
import PayPage from '@/pages/PayPage.vue'
import StatusPage from '@/pages/StatusPage.vue'
import EditConnectionsPage from '@/pages/EditConnectionsPage.vue'
import PromoPage from '@/pages/PromoPage.vue'
import WhitelistPage from '@/pages/WhitelistPage.vue'

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
