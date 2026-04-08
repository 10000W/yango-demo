import type { Account, CHAIN } from '@tonconnect/ui'
import { TonConnectUI, toUserFriendlyAddress } from '@tonconnect/ui'
import { truncate } from '@/utils/string-utils'
import { TON_MANIFEST_URL } from '@/entities/config'
import { computed, reactive, ref, watch } from 'vue'

const balance = ref(0)
const isLoaded = ref(false)
const account: Account = reactive({} as Account)
const walletName = ref('Wallet')
const address = computed(() => account?.address || '')
const chain = computed(() => account.chain)
const friendlyAddress = computed(() => account?.address ? toUserFriendlyAddress(account.address, false) : '')
const shortAddress = computed(() => friendlyAddress.value ? truncate(friendlyAddress.value) : '')
const shorterAddress = computed(() => friendlyAddress.value ? truncate(friendlyAddress.value, 3) : '')
const isConnected = computed(() => Boolean(address.value))

const tonConnectUI = new TonConnectUI({
  manifestUrl: TON_MANIFEST_URL,
})
const modal = tonConnectUI.modal
Object.assign(account, tonConnectUI.account)
tonConnectUI.uiOptions = {
  language: 'en',
  actionsConfiguration: {
    // twaReturnUrl: config.telegramMiniAppBotUrl as `${string}://${string}`,
  },
}

tonConnectUI.connectionRestored.then(() => {
  isLoaded.value = true
  if (address.value) {
    console.log(`[TVM]: Connection restored with wallet ${address.value}`)
    return
  }
  console.log(`[TVM]: Connection restored without wallet`)
})
tonConnectUI.onStatusChange((walletInfo) => {
  if (walletInfo?.account?.address) {
    Object.assign(account, walletInfo.account)
    walletName.value = walletInfo?.name
  }
})

const disconnect = async () => {
  console.log('is disconnected')
  Object.assign(account, {
    address: '',
    chain: '' as CHAIN,
    walletStateInit: '',
    publicKey: '',
  })

  await tonConnectUI.disconnect()
}

watch(address, (value) => {
  if (value) {
    console.log(`[TVM]: Connected wallet: ${value}`)
    return
  }
  console.log('[TVM]: Disconnected wallet')
})

export const useTonConnect = () => {
  return {
    isLoaded,
    isConnected,
    address,
    friendlyAddress,
    walletName,
    shortAddress,
    shorterAddress,
    tonConnectUI,
    chain,
    chainId: chain,
    modal,
    balance,
    disconnect,
  }
}
