<script setup lang="ts">
import { PageHeader } from '@tac-crypto-payment/runtime'
import { BaseSpinner } from '@tac-crypto-payment/ui'
import { computed, onMounted, ref, watch } from 'vue'
import { useAppKit } from '@tac-crypto-payment/runtime'
import { BaseButton } from '@tac-crypto-payment/ui'
import { BaseIcon } from '@tac-crypto-payment/ui'
import { createWalletButton, type Wallet } from '@tac-crypto-payment/runtime'
import { useMandate } from '../useMandate'
import { useRouter } from 'vue-router'
let walletButton: ReturnType<typeof createWalletButton> | undefined

const router = useRouter()
const { selectedPaymentOption: option } = useMandate()
const { isConnected, modal, disconnect } = useAppKit()

const isConnecting = ref(false)
const isConnectionAttempting = ref(false)

const paymentTypeIconUrl = computed(() => option.value?.icon)

const load = async () => {
  if (option.value?.walletName) {
    isConnecting.value = true
    walletButton = createWalletButton('eip155')
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
}
const connect = async () => {
  if (isConnectionAttempting.value) {
    return
  }

  isConnectionAttempting.value = true
  try {
    // AppKit can report a disconnected account after a WalletConnect failure while
    // Wagmi still has the connector as its current connection. Disconnecting even
    // in that state clears the stale connector before the next connect attempt.
    await disconnect()

    if (walletButton) {
      isConnecting.value = true
      await walletButton.connect(option.value?.walletName as Wallet)
    }
    else if (modal) {
      await modal.open({
        view: 'Connect',
        namespace: 'eip155',
      })
    }
  }
  catch (error) {
    // A failed WalletConnect handshake can leave Wagmi's current connector set.
    // Best-effort cleanup makes the Connect button usable again without a reload.
    try {
      await disconnect()
    }
    catch {
      console.warn('Unable to clear the failed wallet connection', error)
    }
  }
  finally {
    isConnecting.value = false
    isConnectionAttempting.value = false
  }
}

onMounted(async () => {
  if (!option.value) {
    router.replace({ name: 'mandate.start' })
    return
  }

  watch(isConnected, (val) => {
    if (val) {
      router.replace({ name: 'mandate.asset' })
    }
  }, { immediate: true })

  if (!isConnected.value) {
    await load()
    connect()
  }
})
</script>

<template>
  <div class="column gap-16">
    <PageHeader :title="option?.name || 'Wallet'" />

    <div class="flex-1 gap-16 column align-center justify-center">
      <BaseSpinner>
        <div
          :class="$style.loadingIcon"
          :style="{backgroundImage: `url(${paymentTypeIconUrl})`}"
        />
      </BaseSpinner>

      <p class="h2 center">
        Open app <br>
        to connect wallet
      </p>
    </div>

    <BaseButton
      :disabled="isConnecting || isConnectionAttempting"
      @click="connect()"
    >
      <div class="flex gap-8 align-center">
        Connect

        <BaseIcon name="link" />
      </div>
    </BaseButton>
  </div>
</template>

<style module lang="scss">
.loadingIcon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
