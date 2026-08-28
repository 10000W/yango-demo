import { nextTick, ref, type Ref, watch } from 'vue'
import type { PaymentConfig } from './types'
import { useTimeoutPoll } from '@vueuse/core'
import { type PaymentOption } from '@tac-crypto-payment/runtime'
import { useAppKit } from '@tac-crypto-payment/runtime'
import { type Asset, createPayZapSdk, evmAssets, PayZapChain, PayZapPayment, PayZapProduct, tronAssets }
  from '@tac-crypto-payment/sdk'

let sdkInstance: ReturnType<typeof createPayZapSdk>

const amount: Ref<number | string | undefined> = ref()
const selectedPaymentOption: Ref<PaymentOption | undefined> = ref()
const selectedChain: Ref<PayZapChain | undefined> = ref()
const selectedAsset: Ref<Asset | undefined> = ref()
const txStatusMessage = ref('')
const paymentMethods: Ref<unknown[]> = ref([])
const product: Ref<PayZapProduct | undefined> = ref()
const paymentSession: Ref<PayZapPayment | undefined> = ref()
let uiConfig: PaymentConfig | undefined

const createSession = async () => {
  console.log('create session', selectedChain.value, selectedAsset.value, product.value)
  if (!selectedChain.value || !selectedAsset.value || !product.value?.id) {
    throw new Error('Some parameters are not specified')
  }

  if (!sdkInstance) {
    throw new Error('TacPaymentSdk instance is not initialized')
  }

  try {
    const session = await sdkInstance.createPayment({
      productId: product.value?.id,
      gasless: product.value.gasless.enabled || false,
      chain: selectedChain.value,
      asset: selectedAsset.value,
      // idempotencyKey?: string;
      // abortController?: AbortController;
      // tronConnector?: TronConnector;
      // evmClient?: WalletClient;
    })
    paymentSession.value = session
    nextTick(() => {
      poll.resume()
    })
    return session
  }
  catch (e) {
    console.warn(e)
    throw new Error('Error while creating session')
  }
}
const loadSession = async (sessionId: string) => {
  if (!sdkInstance) {
    throw new Error('TacPaymentSdk instance is not initialized')
  }

  const session = await sdkInstance.service.getSession(sessionId)
  const namespace = session.chain === 'evm' ? 'eip155' : session.chain
  const tokenAddress = session.metadata?.tokenAddress
  const asset = [...evmAssets, ...tronAssets].find((item) => {
    if (item.namespace !== namespace || item.symbol !== session.asset) {
      return false
    }

    if (!tokenAddress) {
      return true
    }

    return item.namespace === 'eip155'
      ? item.address.toLowerCase() === tokenAddress.toLowerCase()
      : item.address === tokenAddress
  })

  if (!asset) {
    throw new Error(`Unsupported payment asset for session ${sessionId}`)
  }

  selectedAsset.value = asset
  selectedChain.value = asset.namespace === 'eip155' ? 'evm' : asset.namespace
  amount.value = session.amount
  const payment = PayZapPayment.fromSession({
    session,
    asset,
    payZapService: sdkInstance.service,
  })
  paymentSession.value = payment

  if (!['completed', 'expired', 'failed'].includes(payment.state)) {
    poll.resume()
  }

  return payment
}
const updateSession = async () => {
  if (!paymentSession.value || !sdkInstance) {
    return
  }

  await paymentSession.value.refresh().catch((e: Error) => {
    // TODO: Show a warning or something when update fails
    console.warn(e)
  })
}
const poll = useTimeoutPoll(updateSession, 3000, { immediate: false })

const init = async (config: PaymentConfig) => {
  uiConfig = config
  if (!config.productId) {
    throw new Error('Product id is not specified')
  }
  amount.value = undefined
  sdkInstance = createPayZapSdk(config.payzapUrl)
  product.value = await sdkInstance.service.getProduct(config.productId) as PayZapProduct
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
        if (config?.onSuccess) {
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
    loadSession,
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
