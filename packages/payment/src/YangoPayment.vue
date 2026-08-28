<script setup lang="ts">
import { computed, provide } from 'vue'
import PaymentView from './PaymentView.vue'
import type { PaymentConfig, PaymentSetup } from './types'

const { productId = undefined, setup = {} } = defineProps<{
  productId?: string
  setup?: PaymentSetup
}>()

const config = computed<PaymentConfig>(() => ({
  ...setup,
  flow: 'payment',
  productId: productId || setup.productId || '',
}))

provide('tacPaymentUiConfig', config.value)
</script>

<template>
  <PaymentView />
</template>
