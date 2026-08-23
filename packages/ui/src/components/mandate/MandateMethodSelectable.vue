<script setup lang="ts">
import BaseRadio from '@/components/base/BaseRadio.vue'
import { PayZapMandateSetupDataMethod } from '@tac-crypto-payment/sdk'
import MandateMethodInfo from '@/components/mandate/MandateMethodInfo.vue'

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

    <MandateMethodInfo
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
