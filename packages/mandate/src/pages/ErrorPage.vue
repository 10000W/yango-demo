<script setup lang="ts">
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import { BaseButton } from '@tac-crypto-payment/ui'
import { BaseIcon } from '@tac-crypto-payment/ui'
import type { MandateConfig } from '@/types'

const route = useRoute()
const config = inject<MandateConfig | null>('tacPaymentUiConfig', null)
const title = computed(() => route.query.title?.toString() || 'Something went wrong')
const message = computed(() => route.query.message?.toString() || 'Please try again later.')
</script>

<template>
  <div class="column align-center justify-center gap-16 p-24">
    <BaseIcon
      name="important"
      size="48"
      :class="$style.icon"
    />
    <h1 class="h2">
      {{ title }}
    </h1>
    <p class="center c-text-secondary">
      {{ message }}
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
