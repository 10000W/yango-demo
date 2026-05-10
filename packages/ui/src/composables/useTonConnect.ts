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

let tonConnectUI: TonConnectUI | undefined

export const useTonConnect = () => {
  if (!tonConnectUI) {
    tonConnectUI = new TonConnectUI({
      manifestUrl: TON_MANIFEST_URL,
    })
    tonConnectUI.uiOptions = {
      language: 'en',
    }
    Object.assign(account, tonConnectUI.account)
    tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        console.log(`[TVM]: Connected wallet: ${wallet.account.address}`)
        Object.assign(account, wallet.account)
      }
      else {
        console.log('[TVM]: Disconnected wallet')
        Object.assign(account, {
          address: '',
          chain: '' as CHAIN,
          walletStateInit: '',
          publicKey: '',
        })
      }
    })
  }

  const modal = tonConnectUI.modal

  const disconnect = async () => {
    console.log('is disconnected')
    Object.assign(account, {
      address: '',
      chain: '' as CHAIN,
      walletStateInit: '',
      publicKey: '',
    })

    await tonConnectUI!.disconnect()
  }

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
