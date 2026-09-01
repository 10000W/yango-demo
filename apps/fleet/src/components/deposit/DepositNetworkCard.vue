<script setup lang="ts">
import StackableCard from '../StackableCard.vue'
import { depositOptions } from '../../entities/deposit'
import { computed } from 'vue'

const props = defineProps<{
  chain?: string | null
  network?: string | null
}>()

const networkName = computed(() => {
  if (!props.chain) {
    return ''
  }
  const depositOption = depositOptions.find(option => option.value === props.chain || option.value === props.network)

  return depositOption?.label || 'Unknown'
})
</script>

<template>
  <StackableCard>
    <p class="c-text-secondary mb-2">
      Network
    </p>
    <p class="h3">
      {{ networkName || 'Unknown' }}
    </p>
  </StackableCard>
</template>
