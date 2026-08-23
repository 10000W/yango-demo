import { computed, inject, Ref, ref } from 'vue'
import type { TacPaymentUIConfig } from '@/TacPaymentUI'
import {
  Asset, EvmAsset,
  EvmExecutor, IChainExecutor,
  PayZapMandate,
  TacPaymentSdk,
  TronExecutor,
} from '@tac-crypto-payment/sdk'
import { PaymentOption } from '@/entities/payment'
import { TronAsset } from '@tac-crypto-payment/sdk/asset/tron'
import { tronMainnet } from '@reown/appkit/networks'
import { useAppKitProvider } from '@reown/appkit/vue'
import { TronConnector } from '@reown/appkit-adapter-tron'
import { getWalletClient } from '@wagmi/core'
import { wagmiAdapter } from '@/entities/config'
import { useAppKit } from '@/composables/useAppKit'

let sdkInstance: TacPaymentSdk | undefined

const { address } = useAppKit()

const mandate: Ref<PayZapMandate | undefined> = ref()
const selectedPaymentOption: Ref<PaymentOption | undefined> = ref()
const selectedAsset: Ref<EvmAsset | TronAsset | undefined> = ref()
const allowanceAmount = ref('200')
const isInfiniteAllowance = ref(false)

const status = computed(() => mandate.value?.data.status)

const createPaymentExecutor = async () => {
  if ((selectedAsset.value as TronAsset)?.chain?.id === +tronMainnet.id) {
    const { walletProvider: tronProvider } = useAppKitProvider<TronConnector>('tron')

    return new TronExecutor(tronProvider!)
  }

  return new EvmExecutor(await getWalletClient(wagmiAdapter.wagmiConfig))
}
const init = async () => {
  const config = inject<TacPaymentUIConfig>('tacPaymentUiConfig')!

  if (config.flow === 'mandate') {
    if (!config.mandateId) {
      throw new Error('Mandate id is not specified')
    }

    sdkInstance = new TacPaymentSdk({
      service: 'payzap',
      serviceParams: {
        payzapUrl: config.payzapUrl,
      },
    })

    mandate.value = await sdkInstance.getMandate(config.mandateId)
  }
  else {
    throw new Error('Flow from config is not mandate, usePayment is unsupported')
  }
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
