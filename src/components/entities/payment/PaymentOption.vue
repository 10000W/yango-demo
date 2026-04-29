<script setup lang="ts">
import { computed } from 'vue'
import { PaymentOption, paymentOptions } from '@/entities/payment'
import BaseChip from '@/components/base/BaseChip.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { useAppKit } from '@/composables/useAppKit'
import { useTonConnect } from '@/composables/useTonConnect'
import {
  createAppKitWalletButton,
  type Wallet,
} from '@reown/appkit-wallet-button'
import { useRouter } from 'vue-router'
import { usePayment } from '@/composables/usePayment'

const { paymentOption } = defineProps<{
  paymentOption: PaymentOption
}>()

const router = useRouter()
const { selectedChain } = usePayment()
const { isConnected: isEvmConnected, modal: appkitModal, walletInfo } = useAppKit()
const { isConnected: isTonConnected, modal: tonconnectModal } = useTonConnect()

let appKitWalletButton: ReturnType<typeof createAppKitWalletButton>

if (paymentOption.type === 'evm' && paymentOption.walletName) {
  appKitWalletButton = createAppKitWalletButton()
}

const isOptionConnected = computed(() => {
  if (paymentOption.type === 'ton') {
    return isTonConnected.value
  }

  if (paymentOption.type === 'evm') {
    if (!isEvmConnected.value) {
      return false
    }

    const connectedName = walletInfo.value?.name?.toLowerCase() || ''

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
    case 'yango':
      router.push('/promo')
      return
    case 'binance_pay':
      // selectedChain.value = 'binance_pay'
      // router.push({ name: 'asset' })
      return
    case 'ton':
      tonconnectModal.open()
      return
    case 'evm':
      try {
        if (!appKitWalletButton || !appKitWalletButton.isReady()) {
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
  <div
    :class="$style.PaymentOption"
    @click="handleClick"
  >
    <div
      :class="$style.content"
      class="flex gap-4 justify-between"
    >
      <div
        class="flex align-center gap-16"
        :class="$style.left"
      >
        <BaseIcon
          v-if="paymentOption.icon === 'evm'"
          size="54"
          name="other-wallets"
          :class="$style.icon"
        />
        <div
          v-else-if="paymentOption.icon"
          :class="$style.icon"
          :style="iconStyle"
        />
        <div class="column gap-2">
          <div class="p1">
            {{ paymentOption.name }}
          </div>
          <div class="p3 c-text-secondary">
            {{ paymentOption.description }}
          </div>
        </div>
      </div>
      <div class="flex align-center gap-16">
        <BaseChip
          v-if="isOptionConnected"
          :class="$style.connectedChip"
          icon="chain"
          variant="success"
          square
        />

        <BaseChip
          v-if="paymentOption.type === 'yango'"
          variant="success"
        >
          Soon
        </BaseChip>
        <BaseIcon
          v-else
          name="chevron-right"
        />
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.PaymentOption {
  width: 100%;
  padding: 12px 0;
}

.content {
  width: 100%;
}

.left {
  flex: 1;
}

.card {
  background-image: url("/manifest-img.jpg");
}

.icon {
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  color: var(--ypm-color-brand-primary);
}

.connectedChip {
  margin-left: auto;
}
</style>
