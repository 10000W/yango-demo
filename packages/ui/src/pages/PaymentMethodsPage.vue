<script setup lang="ts">
import { usePayment } from '@/composables/usePayment'
import PaymentMethodComponent from '@/components/payment/PaymentMethodSelectable.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'

const { paymentMethods } = usePayment()
</script>

<template>
  <div>
    <div
      :class="$style.title"
      class="flex justify-between align-end gap-8"
    >
      <h1 class="h1 mb-8 flex-1">
        Your methods
      </h1>
    </div>

    <ul
      :class="$style.list"
      class="column"
    >
      <li
        v-for="m in paymentMethods"
        :key="m.name"
      >
        <PaymentMethodComponent :payment-method="m" />
      </li>
    </ul>

    <BaseButton
      class="gap-8"
      variant="secondary"
      wide
    >
      <BaseIcon name="plus" />
      Add another method
    </BaseButton>
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
</style>
