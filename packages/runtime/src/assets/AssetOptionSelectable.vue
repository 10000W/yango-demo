<script setup lang="ts">
import AssetOption from './AssetOption.vue'
import { Asset } from '@tac-crypto-payment/sdk'
import { BaseRadio } from '@tac-crypto-payment/ui'

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
