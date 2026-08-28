<script setup lang="ts">
import { computed, provide } from 'vue'
import FlowView from './FlowView.vue'
import type { MandateConfig, MandateSetup } from './types'

const { mandateId = undefined, setup = {} } = defineProps<{
  mandateId?: string
  setup?: MandateSetup
}>()

const config = computed<MandateConfig>(() => ({
  ...setup,
  flow: 'mandate',
  mandateId: mandateId || setup.mandateId || '',
}))

provide('tacPaymentUiConfig', config.value)
</script>

<template>
  <FlowView />
</template>
