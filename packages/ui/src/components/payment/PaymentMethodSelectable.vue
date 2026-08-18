<script setup lang="ts">
import BaseRadio from '@/components/base/BaseRadio.vue'
import { PaymentMethod } from '@/entities/payment'
import { computed } from 'vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import PaymentMethodInfo from '@/components/payment/PaymentMethodInfo.vue'

const { paymentMethod } = defineProps<{ paymentMethod: PaymentMethod }>()
const model = defineModel<string>()

const isActive = computed(() => model.value === paymentMethod.name)
</script>

<template>
  <div class="flex gap-16 align-center py-12">
    <BaseRadio
      v-model="model"
      :value="paymentMethod.name"
    />

    <PaymentMethodInfo
      :payment-method="paymentMethod"
      :active="isActive"
    />

    <BaseIcon
      class="c-text-primary ml-auto"
      name="pencil"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
