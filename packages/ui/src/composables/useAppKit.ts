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
import { tronMainnet, mainnet, polygon } from '@reown/appkit/networks'

const isLoaded = ref(false)
let modal: AppKit | undefined

export const useAppKit = () => {
  if (!modal) {
    modal = createAppKit({
      adapters: [wagmiAdapter, tronAdapter],
      defaultNetwork: mainnet,
      networks: [mainnet, polygon, tronMainnet],
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
    nextTick(() => {
      setTimeout(() => {
        isLoaded.value = true
      }, 1000)
    })
  }
  const { disconnect: _disconnect } = useDisconnect()
  const accountData = useAppKitAccount()
  const networkData = useAppKitNetwork()
  const walletInfoData = useWalletInfo()

  const walletInfo = computed(() => walletInfoData.walletInfo)
  const isConnected = computed(() => accountData.value.isConnected)
  const address = computed(() => accountData.value.address || '')
  const shortAddress = computed(() => truncate(address.value))
  const isWrongNetwork = computed(() => isLoaded.value && isConnected.value && !wagmiAdapter.networks.map(n => n.id).includes(networkData.value.chainId as number))
  const chainId = computed(() => networkData.value.chainId)
  const status = computed(() => accountData.value.status)

  return {
    modal,
    isConnected,
    address,
    shortAddress,
    isLoaded,
    isWrongNetwork,
    chainId,
    status,
    disconnect: (args?: any) => {
      return _disconnect(args)
    },
    walletInfo,
  }
}
