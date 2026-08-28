<script setup lang="ts">
import { computed } from 'vue'
import type { PaymentOption } from '@/entities/payment'
import { BaseChip, BaseIcon } from '@tac-crypto-payment/ui'

const props = defineProps<{
  paymentOption: PaymentOption
  isConnected?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const iconStyle = computed(() => {
  return {
    backgroundImage: `url("${props.paymentOption.icon}")`,
  }
})

</script>

<template>
  <div
    :class="$style.PaymentOption"
    @click="emit('click')"
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
          v-if="isConnected"
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
  cursor: pointer;
}

.content {
  width: 100%;
}

.left {
  flex: 1;
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
