<script setup lang="ts">
import SelectableCard from '@/components/SelectableCard.vue'
import type { DepositAssetRecord } from '@/entities/deposit'
defineProps<{
  asset: DepositAssetRecord
}>()

const model = defineModel<string>()
</script>

<template>
  <SelectableCard
    v-model="model"
    name="select-asset"
    :label="asset.label"
    :value="asset.value"
    :icon="asset.icon"
  />
</template>

<style module lang="scss">

</style>
