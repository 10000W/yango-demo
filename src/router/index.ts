import { createRouter, createWebHistory } from 'vue-router'
import SelectChainPage from '@/pages/SelectChainPage.vue'
import SelectAssetPage from '@/pages/SelectAssetPage.vue'
import PayPage from '@/pages/PayPage.vue'
import StatusPage from '@/pages/StatusPage.vue'
import EditConnectionsPage from '@/pages/EditConnectionsPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
  ],
})

export default router
