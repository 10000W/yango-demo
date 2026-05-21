import { computed, nextTick, type Ref, ref, watch, inject, Reactive, reactive } from 'vue'
import type { TacCryptoPaymentOptions } from '@/TacCryptoPayment'
import { useTimeoutPoll } from '@vueuse/core'
import { type PaymentOption, paymentOptions } from '@/entities/payment'
import { useAppKit } from '@/composables/useAppKit'
import { type Asset, type SessionChain, type Product, TacPaymentSdk } from '@tac-crypto-payment/sdk'

const sdkInstance: Ref<TacPaymentSdk | undefined> = ref()

const amount: Ref<number | string | undefined> = ref()
const selectedPaymentOption: Ref<PaymentOption | undefined> = ref()
const selectedChain: Ref<SessionChain | undefined> = ref()
const selectedAsset: Ref<Asset | undefined> = ref()
const txStatusMessage = ref('')

const activeSession = computed(() => sdkInstance.value?.session)
const product = computed(() => sdkInstance.value?.product)

const createSession = async () => {
  if (!selectedChain.value || !selectedAsset.value) {
    throw new Error('Some parameters are not specified')
  }

  if (!sdkInstance.value) {
    throw new Error('TacPaymentSdk instance is not initialized')
  }

  try {
    await sdkInstance.value.createSession({
      gasless: true,
      chain: selectedChain.value,
      asset: selectedAsset.value,
    })
    nextTick(() => {
      poll.resume()
    })
  }
  catch {
    throw new Error('Error while creating session')
  }
}
const updateSession = async () => {
  if (!activeSession.value || !sdkInstance.value) {
    return
  }

  await sdkInstance.value.updateSession()
}
const poll = useTimeoutPoll(updateSession, 3000, { immediate: false })

const init = async () => {
  const options = inject<TacCryptoPaymentOptions>('tacPaymentOptions')!

  amount.value = options.amount || undefined
  const instance = await TacPaymentSdk.create({
    productId: options.productId,
    payzapUrl: options.payzapUrl,
  })

  sdkInstance.value = instance
}
const reset = () => {
  if (sdkInstance.value) {
    sdkInstance.value.reset()
  }
  poll.pause()
  selectedChain.value = undefined
  selectedAsset.value = undefined
  selectedPaymentOption.value = undefined
}

watch(() => activeSession.value?.status, (val) => {
  switch (val) {
    case 'failed':
    case 'expired':
    case 'completed':
      poll.pause()
      if (val === 'completed' && activeSession.value) {
        const options = inject<TacCryptoPaymentOptions>('tacPaymentOptions')!
        options.onSuccess?.(activeSession.value)
      }
  }
})

export const usePayment = () => {
  const { address, chainId, isConnected, walletInfo, isLoaded } = useAppKit()

  const isOptionConnected = (option: PaymentOption) => {
    if (!isConnected.value) {
      return false
    }

    if (option.type !== 'blockchain') {
      return false
    }

    const connectedName = walletInfo.value?.name?.toLowerCase() || ''
    if (option.walletName) {
      return connectedName.includes(option.walletName.toLowerCase())
    }

    const otherEvmOptions = paymentOptions.filter(o => o.type === 'blockchain' && o.walletName)
    const matchesAnySpecific = otherEvmOptions.some(o =>
      connectedName.includes(o.walletName!.toLowerCase()),
    )

    return !matchesAnySpecific
  }
  const selectAsset = async (asset: Asset) => {
    selectedAsset.value = asset
    if ('namespace' in asset) {
      selectedChain.value = asset.namespace === 'eip155'
        ? 'evm'
        : asset.namespace
    }
  }

  return {
    init,
    createSession,
    updateSession,
    reset,
    selectAsset,
    isOptionConnected,
    product,
    amount,
    activeSession,
    selectedPaymentOption,
    selectedChain,
    selectedAsset,
    txStatusMessage,
    address,
    chainId,
    isLoaded,
    sdkInstance,
  }
}
