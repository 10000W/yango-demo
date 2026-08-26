<script setup lang="ts">
import SelectableCard from '@/components/SelectableCard.vue'
import { type DepositOptionRecord } from '@/entities/deposit'

defineProps<{
  option: DepositOptionRecord
}>()

const model = defineModel<string>()
</script>

<template>
  <SelectableCard
    v-model="model"
    name="deposit-option"
    :label="option?.label"
    :value="option.value"
    :icon="option?.icon"
    vertical
  />
</template>

<style module lang="scss">

</style>
