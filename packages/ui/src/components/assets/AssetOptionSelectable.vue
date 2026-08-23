<script setup lang="ts">
import AssetOption from '@/components/assets/AssetOption.vue'
import { Asset } from '@tac-crypto-payment/sdk'
import BaseRadio from '@/components/base/BaseRadio.vue'

const { asset } = defineProps<{
  gasless?: boolean
  asset: Asset & { gasless?: boolean }
  value: string
}>()

const model = defineModel<string>()
</script>

<template>
  <AssetOption
    v-bind="$attrs"
    :gasless="gasless"
    :asset="asset"
  >
    <template #right>
      <BaseRadio
        v-model="model"
        :value="value"
      />
    </template>
  </AssetOption>
</template>

<style scoped lang="scss">

</style>
