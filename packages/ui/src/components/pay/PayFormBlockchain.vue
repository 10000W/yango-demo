<script setup lang="ts">
import { usePayment } from '@/composables/usePayment'
import { formatNumber } from '@/utils/string-utils'
import BaseChip from '@/components/base/BaseChip.vue'
import { computed, ref } from 'vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseStack from '@/components/base/BaseStack.vue'
import BaseStackItem from '@/components/base/BaseStackItem.vue'
import BaseProgressTimer from '@/components/base/BaseProgressTimer.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { BaseError } from 'viem'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { useAppKit } from '@/composables/useAppKit'
import { createAppKitWalletButton, type Wallet } from '@reown/appkit-wallet-button'
import { appKitNetworksMap } from '@/entities/appkit'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/vue'
import { AxiosError } from 'axios'
import { EvmExecutor, ExecutorEvent, PayZapService, TronExecutor } from '@tac-crypto-payment/sdk'
import { TronConnector } from '@reown/appkit-adapter-tron'
import { tronMainnet } from '@reown/appkit/networks'
import { TronAsset } from '@tac-crypto-payment/sdk/asset/tron'
import { wagmiAdapter } from '@/entities/config'
import { getWalletClient } from '@wagmi/core'

let walletButton: ReturnType<typeof createAppKitWalletButton> | undefined

const emit = defineEmits<{
  error: [message: string]
}>()

const {
  amount,
  selectedAsset,
  paymentSession,
  txStatusMessage,
  selectedPaymentOption,
  product,
  sdkInstance,
} = usePayment()

const {
  isConnected,
  address,
  chainId,
  modal,
  isInitialized,
  disconnect,
} = useAppKit()

const evmAccount = useAppKitAccount({ namespace: 'eip155' })
const tronAccount = useAppKitAccount({ namespace: 'tron' })

const now = Date.now()

const isConnecting = ref(false)
const isPaying = ref(false)
const isExpired = ref(false)
const errorMessage = ref('')

const onUpdateStatus = (event: ExecutorEvent) => {
  const statusMessages: Record<string, string> = {
    'approval:preparing': 'Preparing token approval...',
    'approval:signing': 'Waiting for a signature...',
    'approval:confirming': 'Confirming token approval...',
    'transfer:preparing': 'Preparing transfer...',
    'transfer:confirming': 'Confirming transfer...',
    'payment:preparing': 'Preparing payment...',
    'payment:sponsoring': 'Requesting gasless transaction...',
    'payment:signing': 'Waiting for a signature...',
    'payment:confirming': 'Confirming payment...',
    'cancelled': 'Transaction cancelled',
    'failed': 'Transaction failed',
  }

  txStatusMessage.value = statusMessages[event.type] || event.type
}

const timerDuration = computed(() => {
  if (!paymentSession.value?.session.expiresAt) {
    return 15 * 60
  }

  const expiresAt = new Date(paymentSession.value.session.expiresAt).getTime()
  return Math.max(0, Math.floor((expiresAt - now) / 1000))
})
const isNamespaceSupported = computed(() => {
  if (!isConnected.value) {
    return true
  }
  if (namespace.value === 'eip155') {
    return evmAccount.value.isConnected
  }
  if (namespace.value === 'tron') {
    return tronAccount.value.isConnected
  }
  return true
})
const namespaceErrorMessage = computed(() => {
  if (!isConnected.value) {
    return ''
  }

  if (!isNamespaceSupported.value) {
    return `Account for ${namespace.value === 'eip155' ? 'EVM' : 'TRON'} not found in your wallet`
  }

  return ''
})
const isCorrectChain = computed(() => {
  if (!selectedAsset.value || !('chain' in selectedAsset.value) || !isConnected.value || !isNamespaceSupported.value) {
    return true
  }
  return chainId.value === selectedAsset.value.chain.id
})
const namespace = computed(() => {
  return selectedAsset.value && 'namespace' in selectedAsset.value
    ? selectedAsset.value.namespace
    : undefined
})
const gasless = computed(() => {
  if (!product.value?.gasless?.enabled || !selectedAsset.value
    || !('chain' in selectedAsset.value)) {
    return false
  }

  return sdkInstance?.service instanceof PayZapService
    ? sdkInstance.service.getSponsorshipMechanism(selectedAsset.value)
    : false
})

const load = async () => {
  txStatusMessage.value = ''

  if (selectedPaymentOption.value?.walletName && namespace.value === 'eip155') {
    isConnecting.value = true
    walletButton = createAppKitWalletButton({
      namespace: namespace.value,
    })
    walletButton.subscribeIsReady(({ isReady }) => {
      isConnecting.value = !isReady
    })
    if (walletButton.isReady()) {
      isConnecting.value = false
    }
  }
  else {
    walletButton = undefined
    isConnecting.value = false
  }

  if (!sdkInstance) {
    throw 'TacPaymentSDK instance is not ready'
  }
}
const createPaymentExecutor = async () => {
  if ((selectedAsset.value as TronAsset)?.chain?.id === +tronMainnet.id) {
    const { walletProvider: tronProvider } = useAppKitProvider<TronConnector>('tron')

    return new TronExecutor(tronProvider!)
  }

  return new EvmExecutor(await getWalletClient(wagmiAdapter.wagmiConfig))
}

const onTimerComplete = () => {
  isExpired.value = true
  emit('error', 'Payment session has expired. Please try again.')
}
const switchNetwork = async () => {
  const asset = selectedAsset.value
  if (!modal || !asset || !('chain' in asset)) {
    throw new Error('Unable to switch network, connector is not ready')
  }

  const network = Object.values(appKitNetworksMap).find(n => n.id === asset.chain.id)
  if (!network) {
    throw new Error(`Unable to find network ${asset.chain.name} in current wallet.`)
  }

  const appKitNetwork = useAppKitNetwork()
  await appKitNetwork.value.switchNetwork(network)

  if (!isCorrectChain.value) {
    throw new Error(`Unable to switch network to ${asset.chain.name}.`)
  }
}
const pay = async () => {
  if (!paymentSession.value) {
    throw new Error('Session not found')
  }

  if (!address.value) {
    throw new Error('Wallet not connected')
  }

  const asset = selectedAsset.value
  if (!asset || !('address' in asset)) {
    throw new Error('Invalid asset for EVM')
  }

  if (!isCorrectChain.value) {
    await switchNetwork()
  }

  // if (!paymentProvider) {
  //   paymentProvider = await createPaymentProvider()
  // }

  if (!paymentSession.value) {
    throw new Error('Payment session not found')
  }
  const executor = await createPaymentExecutor()
  await paymentSession.value.pay({
    fromAddress: (executor instanceof EvmExecutor)
      ? evmAccount.value.address!
      : (executor instanceof TronExecutor)
          ? tronAccount.value.address!
          : '0x0',
    amount: paymentSession.value.session.amount,
    executor,
  }, onUpdateStatus)
}
const handleError = (e: unknown, defaultMessage: string) => {
  console.warn(e)
  if (e instanceof AxiosError) {
    errorMessage.value = e.response?.data?.error?.message || defaultMessage
  }
  else if (e instanceof BaseError) {
    errorMessage.value = e.shortMessage || e.message
  }
  else {
    console.warn(e)
    errorMessage.value = e instanceof Error ? e.message : defaultMessage
  }
}
const connect = async () => {
  if (walletButton) {
    try {
      isConnecting.value = true
      await walletButton.connect(selectedPaymentOption.value?.walletName as Wallet)
      isConnecting.value = false
    }
    catch {
      isConnecting.value = false
    }
  }
  else if (modal) {
    await modal.open({
      view: 'Connect',
      namespace: namespace.value === 'eip155' ? 'eip155' : undefined,
    })
  }
}
const submit = async () => {
  try {
    isPaying.value = true
    errorMessage.value = ''
    await pay()
    // router.replace({ name: 'status', query: { status: 'success' } })
  }
  catch (error) {
    txStatusMessage.value = ''
    isPaying.value = false
    handleError(error, 'Transaction failed')
  }
}

load()

// watch(address, () => {
//   paymentProvider = undefined
// }, { immediate: true })
</script>

<template>
  <form
    class="column gap-16"
    @submit.prevent="submit"
  >
    <div class="column flex-1 gap-16">
      <div
        v-if="selectedAsset"
        class="column gap-8"
      >
        <p class="h6">
          Amount to pay:
        </p>

        <p class="h3">
          {{ formatNumber(paymentSession?.session.amount || amount) }} {{ selectedAsset.symbol }} <span class="c-text-secondary">
            ≈ {{ formatNumber((Number(paymentSession?.session.amount || amount)), 2) }} $</span>
        </p>
      </div>
      <hr>
      <div
        v-if="paymentSession?.session"
        class="column gap-8"
      >
        <p class="h6">
          Address to sent funds to:
        </p>

        <code
          :class="$style.wallet"
          class="h3"
        >
          {{ paymentSession?.session.merchantWallet }}
        </code>
      </div>
    </div>

    <BaseAlert
      v-if="selectedAsset && 'chain' in selectedAsset"
    >
      Only send {{ selectedAsset.symbol }} using the {{ selectedAsset.chain.name }} network
    </BaseAlert>

    <BaseStack>
      <BaseStackItem
        v-if="txStatusMessage"
        key="status"
        label="Status:"
      >
        <div>
          <BaseIcon
            name="loading"
            style="vertical-align: bottom;"
          />
          {{ txStatusMessage }}
        </div>
      </BaseStackItem>
      <BaseStackItem
        key="expires"
        label="Expires in:"
      >
        <BaseProgressTimer
          :duration="timerDuration"
          :size="16"
          color="var(--ypm-color-brand-primary)"
          @complete="onTimerComplete"
        >
          <template #default="{ timeFormatted }">
            <span>{{ timeFormatted }}</span>
          </template>
        </BaseProgressTimer>
      </BaseStackItem>
      <BaseStackItem
        v-if="selectedAsset"
        key="rate"
        label="Rate:"
      >
        1 {{ selectedAsset.symbol }} ≈ 1.00 $
      </BaseStackItem>
      <BaseStackItem
        v-if="gasless"
        key="fee"
        label="Network fee:"
      >
        <BaseChip variant="success">
          Gasless ⚡
        </BaseChip>
      </BaseStackItem>
      <BaseStackItem
        v-if="errorMessage || namespaceErrorMessage"
        key="error"
        label=""
      >
        <div
          class="left flex gap-8 c-text-error"
          style="white-space: pre-line;"
        >
          <BaseIcon name="important" />
          {{ errorMessage || namespaceErrorMessage }}
        </div>
      </BaseStackItem>
    </BaseStack>

    <BaseButton
      v-if="!isConnected"
      key="connect"
      type="button"
      wide
      :disabled="isConnecting || !isInitialized"
      :loading="isConnecting || !isInitialized"
      @click="connect"
    >
      <template v-if="selectedPaymentOption">
        Connect {{ selectedPaymentOption.walletName ? selectedPaymentOption.name : 'Wallet' }}
      </template>
      <template v-else>
        Connect Wallet
      </template>
    </BaseButton>

    <BaseButton
      v-else-if="namespaceErrorMessage"
      key="reconnect"
      type="button"
      wide
      @click="disconnect()"
    >
      Reconnect Wallet
    </BaseButton>

    <BaseButton
      v-else-if="selectedAsset"
      key="pay"
      type="submit"
      wide
      :loading="isPaying"
      class="gap-8"
      :disabled="isExpired || isPaying || !isInitialized"
    >
      Pay now
      <span style="color: #F2EBFF26">·</span>
      {{ formatNumber(amount) }} {{ selectedAsset.symbol }}
    </BaseButton>
  </form>
</template>

<style module lang="scss">
.wallet {
  overflow: hidden;
  word-wrap: break-word;
  display: block;
}
</style>
