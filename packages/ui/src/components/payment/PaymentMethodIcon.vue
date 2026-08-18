<script setup lang="ts">
import BaseIcon from '@/components/base/BaseIcon.vue'
import { computed } from 'vue'
import type { PaymentMethod } from '@/entities/payment'
const props = defineProps<{
  paymentMethod: PaymentMethod
}>()

const iconStyle = computed(() => {
  return {
    backgroundImage: `url("${props.paymentMethod.icon}")`,
  }
})
</script>

<template>
  <BaseIcon
    v-if="paymentMethod.icon === 'evm'"
    size="54"
    name="other-wallets"
    :class="$style.icon"
  />
  <div
    v-else-if="paymentMethod.icon"
    :class="$style.icon"
    :style="iconStyle"
  />
</template>

<style module lang="scss">
.icon {
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  color: var(--ypm-color-brand-primary);
}
</style>
