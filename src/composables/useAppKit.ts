import {
  createAppKit,
  useAppKitNetwork,
  useDisconnect,
  useAppKitAccount,
  useAppKitState,
  useWalletInfo,
} from '@reown/appkit/vue'
import { whenever } from '@vueuse/core'
import { mainnet } from 'viem/chains'
import { computed, nextTick, ref, watch } from 'vue'
import { REOWN_PROJECT_ID, wagmiAdapter } from '@/entities/config'
import { truncate } from '@/utils/string-utils'

const isLoaded = ref(false)
const modal = createAppKit({
  adapters: [wagmiAdapter],
  defaultNetwork: mainnet,
  networks: [mainnet],
  projectId: REOWN_PROJECT_ID,
  metadata: {
    name: 'Yango Payment DEMO',
    description: 'Yango Payment DEMO',
    url: 'https://yango-demo.vercel.app',
    icons: ['https://yango-demo.vercel.app/manifest-img.jpg'],
  },
  features: {
    email: false,
    socials: false,
    analytics: false,
  },
})

const accountData = useAppKitAccount()
const networkData = useAppKitNetwork()
const stateData = useAppKitState()
const walletInfoData = useWalletInfo()
const walletInfo = computed(() => walletInfoData.walletInfo)
const isConnected = computed(() => accountData.value.isConnected)
const address = computed(() => accountData.value.address || '')
const shortAddress = computed(() => truncate(address.value))
const isWrongNetwork = computed(() => isLoaded.value && isConnected.value && !wagmiAdapter.networks.map(n => n.id).includes(networkData.value.chainId as number))
// const isWrongNetwork = computed(() => isLoaded.value && isConnected.value && false)
const chainId = computed(() => networkData.value.chainId)
const status = computed(() => accountData.value.status)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const isReady = computed(() => isLoaded.value && !stateData.isLoading)

nextTick(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 1000)
})

whenever(isReady, () => {
  if (address.value) {
    console.log(`[EVM]: Connection restored with wallet ${address.value}`)
    return
  }
  console.log(`[EVM]: Connection restored without wallet`)
})

watch(address, (value) => {
  if (value) {
    console.log(`[EVM]: Connected wallet: ${value}`)
    return
  }
  console.log('[EVM]: Disconnected wallet')
})

export const useAppKit = () => {
  const { disconnect } = useDisconnect()

  return {
    modal,
    isConnected,
    address,
    shortAddress,
    isLoaded,
    isWrongNetwork,
    chainId,
    status,
    disconnect,
    walletInfo,
  }
}
