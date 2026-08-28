import { computed, inject, Ref, ref } from 'vue'
import type { MandateConfig } from './types'
import {
  Asset,
  EvmExecutor,
  IChainExecutor,
  PayZapMandate,
  createPayZapSdk,
  TronExecutor,
} from '@tac-crypto-payment/sdk'
import { type PaymentOption } from '@tac-crypto-payment/runtime'
import { tronMainnet } from '@reown/appkit/networks'
import { TronConnector } from '@reown/appkit-adapter-tron'
import { getWalletClient } from '@wagmi/core'
import { wagmiAdapter, useAppKit, useAppKitProvider } from '@tac-crypto-payment/runtime'

let sdkInstance: ReturnType<typeof createPayZapSdk> | undefined

const { address } = useAppKit()

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
  if (!selectedAsset.value) {
    throw 'Asset is not selected'
  }

  if (!mandate.value?.data.spenderAddress) {
    throw 'Spender address is not present'
  }

  const executor = await createPaymentExecutor()
  const amount = isInfiniteAllowance.value ? 'infinite' : allowanceAmount.value

  return mandate.value.approve({
    asset: selectedAsset.value,
    fromAddress: address.value!,
    amount,
    toAddress: mandate.value?.data.spenderAddress,
    executor: executor as IChainExecutor<Asset>,
  })
}
export const useMandate = () => {
  return {
    mandate,
    selectedPaymentOption,
    selectedAsset,
    allowanceAmount,
    isInfiniteAllowance,
    init,
    revoke,
    approve,
  }
}
