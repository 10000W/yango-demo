<script setup lang="ts">
import StackableCard from '@/components/StackableCard.vue'
import { formatCurrency } from '@/utils'

withDefaults(defineProps<{
  label?: string
  amount: string | number
  currency: string
}>(), {
  label: 'You’ll receive',
})
</script>

<template>
  <StackableCard>
    <p class="c-text-secondary mb-2">
      {{ label }}
    </p>
    <p class="h3">
      {{ formatCurrency(amount, currency) }}
    </p>
  </StackableCard>
</template>

<style module lang="scss">
.large {
  font-size: 46px !important;
  line-height: 56px !important;
  font-weight: 400 !important;
}
</style>
