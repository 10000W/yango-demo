<script setup lang="ts">
import { paymentOptions } from '@/entities/payment'
import PaymentOption from '@/components/entities/payment/PaymentOption.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { useAppKit } from '@/composables/useAppKit.ts'
import { useTonConnect } from '@/composables/useTonConnect.ts'

const { isConnected: isEvmConnected } = useAppKit()
const { isConnected: isTvmConnected } = useTonConnect()
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
        v-if="isEvmConnected || isTvmConnected"
        :class="$style.editLink"
        :to="{ name: 'edit' }"
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
        <PaymentOption :payment-option="o" />
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
