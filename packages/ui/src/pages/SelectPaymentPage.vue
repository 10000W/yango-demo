<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router'
import { type PaymentOption, paymentOptions } from '@/entities/payment'
import PaymentOptionComponent from '@/components/payment/PaymentOption.vue'
import { usePayment } from '@/composables/usePayment'
import { useAppKit } from '@/composables/useAppKit'
import { useTonConnect } from '@/composables/useTonConnect'
import { computed } from 'vue'
import BaseIcon from '@/components/base/BaseIcon.vue'

const router = useRouter()
const { selectedPaymentOption, isOptionConnected } = usePayment()
const { isConnected: isEvmConnected } = useAppKit()
const { isConnected: isTonConnected } = useTonConnect()

const isAnyConnected = computed(() => isEvmConnected.value || isTonConnected.value)

const handlePaymentOptionClick = async (option: PaymentOption) => {
  if (option.type === 'binance' || option.type === 'bybit') {
    return
  }

  if (option.type === 'yango') {
    router.push('/promo')
    return
  }

  selectedPaymentOption.value = option
  router.push({ name: 'asset' })
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
