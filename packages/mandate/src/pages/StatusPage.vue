<script setup lang="ts">
import { computed, inject } from 'vue'
import type { MandateConfig } from '../types'
import { BaseButton } from '@tac-crypto-payment/ui'
import { BaseIcon } from '@tac-crypto-payment/ui'
import { useRoute, useRouter } from 'vue-router'

const config = inject<MandateConfig | null>('tacPaymentUiConfig', null)
const route = useRoute()
const router = useRouter()
const hasOnClose = computed(() => !!config?.onClose)

const handleClose = () => {
  if (config?.onClose) {
    config.onClose()
    return
  }

  router.replace({
    name: 'mandate.start',
    params: { mandateId: route.params.mandateId },
  })
}
</script>

<template>
  <div
    :class="$style.page"
    class="column gap-16"
  >
    <div :class="$style.content">
      <BaseIcon
        class="c-text-success"
        name="success"
        :size="60"
      />

      <h1 class="h1 center mb-8">
        Wallet connected
      </h1>

      <p
        class="h4 center c-text-secondary"
        :class="$style.description"
      >
        Auto-debit is active. Future rides are charged automatically — no web page will open again.
      </p>
    </div>

    <BaseButton
      wide
      @click="handleClose"
    >
      {{ hasOnClose ? 'Return to the app' : 'Go back' }}
    </BaseButton>
  </div>
</template>

<style module lang="scss">
.page {
  align-items: center;
  justify-content: space-between;
  height: 100%;
  text-align: center;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.description {
  max-width: 420px;
}
</style>
