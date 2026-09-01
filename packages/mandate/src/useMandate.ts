import { computed, inject, Ref, ref } from 'vue'
import type { MandateConfig } from './types'
import {
  Asset,
  createPayZapSdk,
  EvmExecutor,
  IChainExecutor,
  PayZapMandate,
  PayZapMandateSetupBinanceKindResponse,
  TronExecutor,
} from '@tac-crypto-payment/sdk'
import {
  type PaymentOption,
  useAppKit,
  useAppKitProvider,
  wagmiAdapter,
} from '@tac-crypto-payment/runtime'
import { tronMainnet } from '@reown/appkit/networks'
import { TronConnector } from '@reown/appkit-adapter-tron'
import { getWalletClient } from '@wagmi/core'
import { useTimeoutPoll } from '@vueuse/core'

let sdkInstance: ReturnType<typeof createPayZapSdk> | undefined

const { address } = useAppKit()

const binance: Ref<{
  isSubmitting: boolean
  setupData: PayZapMandateSetupBinanceKindResponse
  amount: string
}> = ref({
  isSubmitting: false,
  setupData: {
    qrcodeLink: null,
    qrContent: null,
    deeplink: null,
    expiresAt: null,
  },
  amount: '50',
})
const mandate: Ref<PayZapMandate | undefined> = ref()
const selectedPaymentOption: Ref<PaymentOption | undefined> = ref()
const selectedAsset: Ref<Asset | undefined> = ref()
const allowanceAmount = ref('200')
const isInfiniteAllowance = ref(false)

const status = computed(() => mandate.value?.data.status)

const createPaymentExecutor = async () => {
  if (selectedAsset.value?.chain?.id === +tronMainnet.id) {
    const { walletProvider: tronProvider } = useAppKitProvider<TronConnector>('tron')

    return new TronExecutor(tronProvider!)
  }

  return new EvmExecutor(await getWalletClient(wagmiAdapter.wagmiConfig))
}
const init = async () => {
  const config = inject<MandateConfig>('tacPaymentUiConfig')!

  if (!config.mandateId) throw new Error('Mandate id is not specified')
  sdkInstance = createPayZapSdk(config.payzapUrl)
  mandate.value = await sdkInstance.getMandate(config.mandateId)
}
const revoke = async () => {
  if (!mandate.value) {
    throw new Error('Mandate is not initialized')
  }

  await mandate.value.refresh()
  if (status.value !== 'active') {
    throw new Error('Only an active mandate can be revoked')
  }

  const response = await mandate.value.revoke()
  if (!response.success || response.data.status !== 'revoked') {
    throw new Error('PayZap did not confirm that the mandate was revoked')
  }

  await mandate.value.refresh()
}
const approve = async () => {
  if (!mandate.value) {
    throw new Error('Mandate is not initialized')
  }

  if (!selectedAsset.value && selectedPaymentOption.value?.type === 'blockchain') {
    throw new Error('Asset is not selected')
  }

  if (!mandate.value?.data.spenderAddress && selectedPaymentOption.value?.type === 'blockchain') {
    throw new Error('Spender address is not present')
  }

  const kind = selectedPaymentOption.value?.type === 'binance'
    ? 'binance'
    : 'blockchain'
  const amount = isInfiniteAllowance.value ? 'infinite' : allowanceAmount.value

  if (kind === 'binance') {
    return await mandate.value.approve({
      kind,
      amount: binance.value.amount,
    })
  }
  else {
    const executor = await createPaymentExecutor()
    return await mandate.value.approve({
      kind,
      asset: selectedAsset.value!,
      fromAddress: address.value!,
      amount,
      toAddress: mandate.value?.data.spenderAddress,
      executor: executor as IChainExecutor<Asset>,
    })
  }
}
const updateMandate = async () => {
  if (!mandate.value) {
    throw new Error('Mandate is not initialized')
  }

  await mandate.value.refresh()
}

// Poll only if binance flow is used after amount confirmation
const poll = useTimeoutPoll(updateMandate, 5000, { immediate: false })

export const useMandate = () => {
  return {
    mandate,
    selectedPaymentOption,
    selectedAsset,
    allowanceAmount,
    isInfiniteAllowance,
    binance,
    poll,
    status,
    init,
    revoke,
    approve,
  }
}
