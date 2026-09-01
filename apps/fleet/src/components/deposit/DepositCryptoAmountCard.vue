<script setup lang="ts">
import StackableCard from '../StackableCard.vue'
import { formatCryptocurrency } from '../../utils'

withDefaults(defineProps<{
  label?: string
  amount: string | number
  asset: string
}>(), {
  label: 'Deposit amount',
})
</script>

<template>
  <StackableCard>
    <p class="c-text-secondary mb-2">
      {{ label }}
    </p>

    <p class="h3">
      {{ formatCryptocurrency(amount, asset) }}
    </p>
  </StackableCard>
</template>

<style module lang="scss">

</style>
