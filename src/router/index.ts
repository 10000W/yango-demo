import { createRouter, createWebHashHistory } from 'vue-router'
import SelectChainPage from '@/pages/SelectChainPage.vue'
import SelectAssetPage from '@/pages/SelectAssetPage.vue'
import PayPage from '@/pages/PayPage.vue'
import StatusPage from '@/pages/StatusPage.vue'
import EditConnectionsPage from '@/pages/EditConnectionsPage.vue'
import PromoPage from '@/pages/PromoPage.vue'
import WhitelistSuccessPage from '@/pages/WhitelistSuccessPage.vue'

export const createPaymentRouter = (base = '/') => createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: 'chain',
      path: '/chain',
      component: SelectChainPage,
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
      name: 'whitelist-success',
      path: '/whitelist-success',
      component: WhitelistSuccessPage,
    },
  ],
})

const router = createPaymentRouter()
export default router
