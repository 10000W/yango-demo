<script setup lang="ts">
import { inject } from 'vue'
import { BaseButton } from '@tac-crypto-payment/ui'
import { BaseIcon } from '@tac-crypto-payment/ui'
import type { MandateConfig } from '../types'

const props = withDefaults(defineProps<{
  title?: string
  message?: string
}>(), {
  title: 'Something went wrong',
  message: 'Please try again later.',
})

const config = inject<MandateConfig | null>('tacPaymentUiConfig', null)
</script>

<template>
  <div class="column align-center justify-center gap-16 p-24">
    <BaseIcon
      name="important"
      size="48"
      :class="$style.icon"
    />
    <h1 class="h2">
      {{ props.title }}
    </h1>
    <p class="center c-text-secondary">
      {{ props.message }}
    </p>
    <BaseButton
      v-if="config?.onClose"
      variant="primary"
      wide
      @click="config.onClose"
    >
      Close
    </BaseButton>
  </div>
</template>

<style lang="scss" module>
.icon {
  color: var(--ypm-color-state-error);
  margin-bottom: 24px;
}
</style>
