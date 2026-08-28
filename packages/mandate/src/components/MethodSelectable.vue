<script setup lang="ts">
import { BaseRadio } from '@tac-crypto-payment/ui'
import { PayZapMandateSetupDataMethod } from '@tac-crypto-payment/sdk'
import MethodInfo from './MethodInfo.vue'

const { method } = defineProps<{ method: PayZapMandateSetupDataMethod }>()
const model = defineModel<string>()
</script>

<template>
  <div class="flex gap-16 align-center py-12">
    <BaseRadio
      name="mandate-method"
      :value="method.id"
      :model-value="model"
    />

    <MethodInfo
      :method="method"
      :active="method.isActive"
    />

    <!--    <BaseIcon-->
    <!--      class="c-text-primary ml-auto"-->
    <!--      name="pencil"-->
    <!--    />-->
  </div>
</template>

<style scoped lang="scss">

</style>
