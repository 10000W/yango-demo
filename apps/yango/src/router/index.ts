import { createRouter, createWebHistory } from 'vue-router'
import ErrorPage from '@/pages/ErrorPage.vue'

export const createAppRouter = (base = '/') => createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: 'error',
      path: '/error',
      component: ErrorPage,
    },
    {
      name: 'payment',
      path: '/payment/:id',
      alias: '/pay/:id',
      component: () => import('@/pages/PaymentPage.vue'),
    },
    {
      name: 'setup',
      path: '/setup/:id',
      alias: '/mandate/:id',
      component: () => import('@/pages/MandatePage.vue'),
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
