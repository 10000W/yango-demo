import {
  createAppKit,
  useAppKitNetwork,
  useDisconnect,
  useAppKitAccount,
  useWalletInfo,
  AppKit,
} from '@reown/appkit/vue'
import { computed, nextTick, ref } from 'vue'
import { APP_METADATA, REOWN_PROJECT_ID, wagmiAdapter } from './entities/config'
import { truncate } from './utils/string-utils'
import type { ChainAdapter } from '@reown/appkit'
import {
  type AppKitNetwork,
  arbitrum, base, baseSepolia,
  bsc,
  mainnet,
  polygon,
  tronMainnet,
} from '@reown/appkit/networks'
import { appKitNetworksMap } from './entities/appkit'
import { PayZapProduct } from '@tac-crypto-payment/sdk'

const isLoaded = ref(false)
const isInitialized = ref(false)

let modal: AppKit | undefined

const init = (product?: PayZapProduct) => {
  if (modal) {
    return modal
  }
  const adapters: ChainAdapter[] = []
  const networks: AppKitNetwork[] = []

  if (!product) {
    adapters.push(wagmiAdapter)
    Object.values(appKitNetworksMap).forEach(n => networks.push(n))
  }
  else {
    if (product.availableChains.includes('evm')) {
      adapters.push(wagmiAdapter)
      product.evmNetworks.forEach((name) => {
        networks.push(appKitNetworksMap[name])
      })
    }

    if (product.availableChains.includes('tron')) {
      networks.push(tronMainnet)
    }
  }

  if (!networks.length) {
    throw new Error('Networks are not provided')
  }

  if (!networks.length) {
    throw new Error('Networks are not provided')
  }

  console.log(REOWN_PROJECT_ID)
  modal = createAppKit({
    adapters,
    networks: [mainnet, bsc, polygon, arbitrum, base, baseSepolia, tronMainnet], // TODO: hardcoded
    projectId: REOWN_PROJECT_ID,
    metadata: APP_METADATA,
    experimental_preferUniversalLinks: true,
    enableBaseAccount: false,
    enableCoinbase: false,
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
