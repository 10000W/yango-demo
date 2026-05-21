import {
  createAppKit,
  useAppKitNetwork,
  useDisconnect,
  useAppKitAccount,
  useWalletInfo,
  AppKit,
} from '@reown/appkit/vue'
import { computed, nextTick, ref } from 'vue'
import { REOWN_PROJECT_ID, tronAdapter, wagmiAdapter } from '@/entities/config'
import { truncate } from '@/utils/string-utils'
import type { ChainAdapter } from '@reown/appkit'
import {
  type AppKitNetwork,
  arbitrum, base, baseSepolia,
  bsc,
  mainnet,
  polygon,
  tronMainnet,
} from '@reown/appkit/networks'
import { appKitNetworksMap } from '@/entities/appkit'
import { Product } from '@tac-crypto-payment/sdk'

const isLoaded = ref(false)
const isInitialized = ref(false)

let modal: AppKit | undefined

const init = (product: Product) => {
  if (modal) {
    return modal
  }
  const adapters: ChainAdapter[] = []
  const networks: AppKitNetwork[] = []

  if (product.availableChains.includes('evm')) {
    adapters.push(wagmiAdapter)
    product.evmNetworks.forEach((name) => {
      networks.push(appKitNetworksMap[name])
    })
  }

  if (product.availableChains.includes('tron')) {
    adapters.push(tronAdapter)
    networks.push(tronMainnet)
  }

  if (!networks.length) {
    throw new Error('Networks are not provided')
  }

  modal = createAppKit({
    adapters,
    networks: [mainnet, polygon, bsc, arbitrum, base, baseSepolia, tronMainnet],
    projectId: REOWN_PROJECT_ID,
    metadata: {
      name: 'Yango Payment DEMO',
      description: 'Yango Payment DEMO',
      url: 'https://yango-demo.vercel.app',
      icons: ['https://yango-demo.vercel.app/manifest-img.jpg'],
    },
    features: {
      swaps: false,
      onramp: false,
      send: false,
      history: false,
      email: false,
      socials: false,
      analytics: false,
    },
  })

  modal.subscribeState((state) => {
    isInitialized.value = state.initialized
  })
  nextTick(() => {
    setTimeout(() => {
      isLoaded.value = true
    }, 1000)
  })
}
export const useAppKit = () => {
  const { disconnect: _disconnect } = useDisconnect()
  const accountData = useAppKitAccount()
  const networkData = useAppKitNetwork()

  const walletInfo = computed(() => {
    const walletInfoData = useWalletInfo()
    return walletInfoData.walletInfo
  })
  const isConnected = computed(() => accountData.value.isConnected)
  const address = computed(() => accountData.value.address || '')
  const shortAddress = computed(() => truncate(address.value))
  const chainId = computed(() => networkData.value.chainId)
  const status = computed(() => accountData.value.status)

  return {
    modal,
    isConnected,
    address,
    shortAddress,
    isLoaded,
    isInitialized,
    chainId,
    status,
    init,
    disconnect: () => {
      return _disconnect()
    },
    walletInfo,
  }
}
