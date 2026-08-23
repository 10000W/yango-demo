<script setup lang="ts">
import { inject } from 'vue'
import type { TacPaymentUIConfig } from '@/TacPaymentUI'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'

const config = inject<TacPaymentUIConfig | null>('tacPaymentUiConfig', null)
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
      @click="config?.onClose?.()"
    >
      Return to the app
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
