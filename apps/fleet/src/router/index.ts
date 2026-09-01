import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import ErrorPage from '../pages/ErrorPage.vue'
import MainView from '../MainView.vue'
import DepositPage from '../pages/DepositPage.vue'
import ChoosePage from '../pages/ChoosePage.vue'

export const createFleetRoutes = (): RouteRecordRaw[] => [
  {
    name: 'fleet.main',
    path: '/fleets/:id',
    component: MainView,
    redirect: to => ({
      name: 'fleet.deposit-setup',
      params: { id: to.params.id },
    }),
    children: [
      {
        name: 'fleet.error',
        path: 'error',
        component: ErrorPage,
      },
      {
        name: 'fleet.deposit-setup',
        path: 'setup',
        component: ChoosePage,
      },
      {
        name: 'fleet.deposit-form',
        path: 'deposit',
        component: DepositPage,
      },
      {
        path: ':pathMatch(.*)*',
        component: ErrorPage,
        props: {
          title: '404 Not Found',
          message: 'The page you are looking for does not exist.',
        },
      },
    ],
  },
]

export const createAppRouter = (base = '/') => createRouter({
  history: createWebHistory(base),
  routes: createFleetRoutes(),
})
