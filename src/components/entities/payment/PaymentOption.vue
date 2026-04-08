<script setup lang="ts">
import { computed, watch } from 'vue'
import { PaymentOption, paymentOptions } from '@/entities/payment'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseChip from '@/components/base/BaseChip.vue'
import { useAppKit } from '@/composables/useAppKit.ts'
import { useTonConnect } from '@/composables/useTonConnect.ts'
import {
  createAppKitWalletButton,
  type Wallet,
} from '@reown/appkit-wallet-button'
import { useRouter } from 'vue-router'
import { usePayment } from '@/composables/usePayment.ts'

const { paymentOption } = defineProps<{
  paymentOption: PaymentOption
}>()

const router = useRouter()
const { selectedChain } = usePayment()
const { isConnected: isEvmConnected, modal: appkitModal, walletInfo } = useAppKit()
const { isConnected: isTonConnected, modal: tonconnectModal } = useTonConnect()

let appKitWalletButton: ReturnType<typeof createAppKitWalletButton> | undefined

if (paymentOption.type === 'evm' && paymentOption.walletName) {
  appKitWalletButton = createAppKitWalletButton()
}

const isOptionConnected = computed(() => {
  if (paymentOption.type === 'ton') {
    return isTonConnected.value
  }

  if (paymentOption.type === 'evm') {
    if (!isEvmConnected.value)
      return false

    const connectedName = walletInfo.value?.name?.toLowerCase() || ''
    console.log(walletInfo)

    if (paymentOption.walletName) {
      return connectedName.includes(paymentOption.walletName.toLowerCase())
    }

    const otherEvmOptions = paymentOptions.filter(o => o.type === 'evm' && o.walletName)
    const matchesAnySpecific = otherEvmOptions.some(o => connectedName.includes(o.walletName!.toLowerCase()))

    return !matchesAnySpecific
  }

  return false
})

const iconStyle = computed(() => {
  return {
    backgroundImage: `url("${paymentOption.icon}")`,
  }
})

const handleClick = async () => {
  if (isOptionConnected.value) {
    selectedChain.value = paymentOption.type
    router.push({ name: 'asset' })
    return
  }
  switch (paymentOption.type) {
    case 'ton':
      tonconnectModal.open()
      return
    case 'evm':
      try {
        if (!appKitWalletButton || !appKitWalletButton.isReady()) {
        // if (true) {
          throw 'Wallet name is not provided, fallback to appkit modal'
        }

        appKitWalletButton.connect(paymentOption.walletName as Wallet).then(() => {
          selectedChain.value = 'evm'
          router.push({ name: 'asset' })
        }).catch()
      }
      catch {
        appkitModal.open({
          view: 'Connect',
        })
      }
      return
  }
}
</script>

<template>
  <BaseButton
    variant="secondary"
    :class="$style.PaymentOption"
    @click="handleClick"
  >
    <div :class="$style.content">
      <div
        v-if="paymentOption.icon"
        :class="$style.icon"
        :style="iconStyle"
      />
      <span :class="$style.info">
        <span :class="$style.name">
          {{ paymentOption.name }}
        </span>
        <span :class="$style.description">
          {{ paymentOption.description }}
        </span>
      </span>
      <BaseChip
        v-if="isOptionConnected"
        :class="$style.connectedChip"
        variant="success"
      >
        Connected
      </BaseChip>
    </div>
  </BaseButton>
</template>

<style module lang="scss">
.PaymentOption {
  width: 100%;
  height: 60px;
  padding: 8px 16px;
}

.content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  width: 100%;
  gap: 12px;
}

.icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-left: -4px;
}

.info {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  color: var(--c-text);
}

.description {
  font-size: 0.75rem;
  color: var(--c-text-soft);
  line-height: 1rem;
}

.connectedChip {
  margin-left: auto;
}
</style>
