<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router'
import { type PaymentOption, paymentOptions } from '@/entities/payment'
import PaymentOptionComponent from '@/components/payment/PaymentOption.vue'
import { usePayment } from '@/composables/usePayment'
import { useAppKit } from '@/composables/useAppKit'
import { computed, ref } from 'vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseBottomSheet from '@/components/base/BaseBottomSheet.vue'

const router = useRouter()
const { selectedPaymentOption, isOptionConnected } = usePayment()
const { isConnected: isEvmConnected, disconnect: disconnectEvm } = useAppKit()

const isConfirmOpen = ref(false)
const confirmResolve = ref<((value: boolean) => void) | null>(null)
const pendingOption = ref<PaymentOption | null>(null)

const isAnyConnected = computed(() => isEvmConnected.value)

const handlePaymentOptionClick = async (option: PaymentOption) => {
  if (option.type === 'binance' || option.type === 'bybit') {
    return
  }

  if (option.type === 'yango') {
    router.push('/promo')
    return
  }

  if (isEvmConnected.value && !isOptionConnected(option)) {
    pendingOption.value = option
    const confirmed = await confirmDisconnect()
    if (!confirmed) {
      return
    }
    await disconnectEvm()
  }

  selectedPaymentOption.value = option
  router.push({ name: 'asset' })
}
const confirmDisconnect = () => {
  isConfirmOpen.value = true
  return new Promise<boolean>((resolve) => {
    confirmResolve.value = resolve
  })
}
const handleConfirm = (value: boolean) => {
  isConfirmOpen.value = false
  if (confirmResolve.value) {
    confirmResolve.value(value)
    confirmResolve.value = null
  }
}
</script>

<template>
  <div>
    <div
      :class="$style.title"
      class="flex justify-between align-end gap-8"
    >
      <h1 class="h1 mb-8 flex-1">
        Select payment method
      </h1>

      <RouterLink
        v-if="isAnyConnected"
        :class="$style.editLink"
        to="/edit"
      >
        <BaseIcon
          size="32"
          name="edit-wallet"
        />
      </RouterLink>
    </div>

    <ul
      :class="$style.list"
      class="column"
    >
      <li
        v-for="o in paymentOptions"
        :key="o.name"
      >
        <PaymentOptionComponent
          :payment-option="o"
          :is-connected="isOptionConnected(o)"
          @click="handlePaymentOptionClick(o)"
        />
      </li>
    </ul>

    <BaseBottomSheet
      v-model="isConfirmOpen"
      to=".tac-crypto-payment"
      @close="handleConfirm(false)"
    >
      <div class="column align-center p-24 pt-0">
        <div class="h2 mb-8 center">
          Switch wallet?
        </div>

        <div class="c-text-secondary mb-24 center">
          You are already connected with another wallet. Do you want to disconnect it and connect {{ pendingOption?.name }}?
        </div>

        <div
          class="flex gap-12"
          :class="$style.confirmBtns"
        >
          <BaseButton
            class="flex-1"
            variant="secondary"
            @click="handleConfirm(false)"
          >
            Cancel
          </BaseButton>
          <BaseButton
            class="flex-1"
            variant="primary"
            @click="handleConfirm(true)"
          >
            Confirm
          </BaseButton>
        </div>
      </div>
    </BaseBottomSheet>
  </div>
</template>

<style module lang="scss">
.title {
  width: 100%;
  margin: 0;
}

.editLink {
  color: var(--ypm-color-brand-primary);
}

.list {
  list-style: none;
  padding: 0;

  & > *:not(:last-child) {
    border-bottom: 1px solid var(--ypm-color-border-default)
  }
}

.confirmBtns {
  width: 100%;
}

.evmInfo {
  margin: 12px 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.walletIcon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.muted {
  color: var(--c-text-soft);
  font-size: 0.85rem;
}
</style>
