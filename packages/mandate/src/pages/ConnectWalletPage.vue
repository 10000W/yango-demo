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
  if (isConnected.value) {
    await disconnect()
  }
  if (walletButton) {
    try {
      isConnecting.value = true
      await walletButton.connect(option.value?.walletName as Wallet)
      isConnecting.value = false
    }
    catch {
      isConnecting.value = false
    }
  }
  else if (modal) {
    await modal.open({
      view: 'Connect',
      namespace: 'eip155',
    })
  }
}

onMounted(async () => {
  if (!isConnected.value) {
    await load()
    connect()
  }
})

watch(isConnected, (val) => {
  if (val) {
    router.replace({ name: 'mandate.asset' })
  }
}, { immediate: true })
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
      :disabled="isConnecting"
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
