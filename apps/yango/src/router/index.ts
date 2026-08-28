import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import ErrorPage from '@/pages/ErrorPage.vue'
import { createPaymentRoutes } from '@tac-crypto-payment/payment'
import { createMandateRoutes } from '@tac-crypto-payment/mandate'

const payzapUrl = 'https://staging-api.payzap.cc'
const featureRoutes: RouteRecordRaw[] = [
  ...(createPaymentRoutes({ payzapUrl }) as unknown as RouteRecordRaw[]),
  ...(createMandateRoutes({ payzapUrl }) as unknown as RouteRecordRaw[]),
]

export const createAppRouter = (base = '/') => createRouter({
  history: createWebHistory(base),
  routes: [
    {
      name: 'error',
      path: '/error',
      component: ErrorPage,
    },
    ...featureRoutes,
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
