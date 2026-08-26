import { createRouter, createWebHistory } from 'vue-router'
import ErrorPage from '@/pages/ErrorPage.vue'
import MainView from '../MainView.vue'
import DepositPage from '@/pages/DepositPage.vue'
import ChoosePage from '@/pages/ChoosePage.vue'

export const createAppRouter = (base = '/') => createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: 'main',
      path: '/:depositId',
      component: MainView,
      redirect: { name: 'deposit-setup' },
      children: [
        {
          name: 'error',
          path: '/error',
          component: ErrorPage,
        },
        {
          name: 'deposit-setup',
          path: 'setup',
          component: ChoosePage,
        },
        {
          name: 'deposit-form',
          path: 'deposit',
          component: DepositPage,
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
    },
  ],
})
