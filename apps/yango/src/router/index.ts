import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import ErrorPage from '@/pages/ErrorPage.vue'

const payzapUrl = 'https://staging-api.payzap.cc'
type Feature = 'payment' | 'mandate' | 'fleet'

const featureLoaders: Record<Feature, () => Promise<RouteRecordRaw[]>> = {
  payment: async () => {
    const { createPaymentRoutes } = await import('@tac-crypto-payment/payment')
    return createPaymentRoutes({ payzapUrl }) as unknown as RouteRecordRaw[]
  },
  mandate: async () => {
    const { createMandateRoutes } = await import('@tac-crypto-payment/mandate')
    return createMandateRoutes({ payzapUrl }) as unknown as RouteRecordRaw[]
  },
  fleet: async () => {
    const { createFleetRoutes } = await import('fleet')
    return createFleetRoutes()
  },
}

export const featureForPath = (path: string): Feature | undefined => {
  if (path.startsWith('/payment/') || path === '/payment' || path.startsWith('/pay/')) {
    return 'payment'
  }

  if (path.startsWith('/riders/') || path === '/riders' || path.startsWith('/setup/')) {
    return 'mandate'
  }

  if (path.startsWith('/fleets/') || path === '/fleets') {
    return 'fleet'
  }
}

export const createAppRouter = (base = '/') => {
  const router = createRouter({
    history: createWebHistory(base),
    routes: [
      {
        name: 'error',
        path: '/error',
        component: ErrorPage,
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

  const loadedFeatures = new Set<Feature>()
  router.beforeEach(async (to) => {
    const feature = featureForPath(to.path)
    if (!feature || loadedFeatures.has(feature)) {
      return true
    }

    const routes = await featureLoaders[feature]()
    routes.forEach(route => router.addRoute(route))
    loadedFeatures.add(feature)

    // Re-match the current URL now that its feature routes exist.
    return to.fullPath
  })

  return router
}
