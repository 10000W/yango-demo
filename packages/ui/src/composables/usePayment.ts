import { nextTick, ref, type Ref, watch } from 'vue'
import type { TacPaymentUIConfig } from '@/TacPaymentUI'
import { useTimeoutPoll } from '@vueuse/core'
import { type PaymentOption, paymentOptions } from '@/entities/payment'
import { useAppKit } from '@/composables/useAppKit'
import { type Asset, TacPaymentSdk } from '@tac-crypto-payment/sdk'
import { PayZapChain, PayZapPayment, PayZapProduct } from '@tac-crypto-payment/sdk'

let sdkInstance: TacPaymentSdk

const amount: Ref<number | string | undefined> = ref()
const selectedPaymentOption: Ref<PaymentOption | undefined> = ref()
const selectedChain: Ref<PayZapChain | undefined> = ref()
const selectedAsset: Ref<Asset | undefined> = ref()
const txStatusMessage = ref('')
const paymentMethods: Ref<unknown[]> = ref([])
const product: Ref<PayZapProduct | undefined> = ref()
const paymentSession: Ref<PayZapPayment | undefined> = ref()
let uiConfig: TacPaymentUIConfig | undefined

const createSession = async () => {
  console.log('create session', selectedChain.value, selectedAsset.value, product.value)
  if (!selectedChain.value || !selectedAsset.value || !product.value?.id) {
    throw new Error('Some parameters are not specified')
  }

  if (!sdkInstance) {
    throw new Error('TacPaymentSdk instance is not initialized')
  }

  try {
    paymentSession.value = await sdkInstance.createPayment()({
      productId: product.value?.id,
      gasless: product.value.gasless.enabled || false,
      chain: selectedChain.value,
      asset: selectedAsset.value,
      // idempotencyKey?: string;
      // abortController?: AbortController;
      // tronConnector?: TronConnector;
      // evmClient?: WalletClient;
    })
    nextTick(() => {
      poll.resume()
    })
  }
  catch (e) {
    console.warn(e)
    throw new Error('Error while creating session')
  }
}
const updateSession = async () => {
  console.log('update...', paymentSession.value, sdkInstance)
  if (!paymentSession.value || !sdkInstance) {
    return
  }

  await paymentSession.value.refresh().catch((e) => {
    // TODO: Show a warning or something when update fails
    console.warn(e)
  })
}
const poll = useTimeoutPoll(updateSession, 3000, { immediate: false })

const init = async (config: TacPaymentUIConfig) => {
  uiConfig = config
  if (config.flow === 'payment') {
    if (!config.productId) {
      throw new Error('Product id is not specified')
    }

    amount.value = config.amount || undefined
    sdkInstance = new TacPaymentSdk({
      service: 'payzap',
      serviceParams: {
        payzapUrl: config.payzapUrl,
      },
    })
    product.value = await sdkInstance.getProduct(config.productId) as PayZapProduct
  }
  else {
    throw new Error('Flow from config is not payment, usePayment is unsupported')
  }
}
const reset = () => {
  poll.pause()
  // product.value = undefined
  selectedChain.value = undefined
  selectedAsset.value = undefined
  paymentSession.value = undefined
  selectedPaymentOption.value = undefined
}

watch(() => paymentSession.value?.state, (val) => {
  switch (val) {
    case 'failed':
    case 'expired':
    case 'completed':
      poll.pause()
      if (val === 'completed' && paymentSession.value) {
        const config = uiConfig
        if (config?.flow === 'payment' && config.onSuccess) {
          config.onSuccess(paymentSession.value)
        }
      }
  }
})

export const usePayment = () => {
  const { address, chainId, isLoaded } = useAppKit()

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
    paymentMethods,
    product,
    amount,
    paymentSession,
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
