<script setup lang="ts">
import { BaseButton, BaseIcon } from '@tac-crypto-payment/ui'
import { useDeposit } from '../../composables/useDeposit'

const { deposit } = useDeposit()
</script>

<template>
  <header
    :class="$style.TheHeader"
    class="flex align-center"
  >
    <div class="container">
      <div class="flex gap-12 justify-self-end">
        <BaseButton
          :class="$style.btn"
          variant="secondary"
          class="gap-8"
          :href="deposit?.returnUrl || undefined"
          rel="noreferrer"
          :disabled="!deposit?.returnUrl"
        >
          Return to Fleet
          <BaseIcon name="link" />
        </BaseButton>
      </div>
    </div>
  </header>
</template>

<style module lang="scss">
.TheHeader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flow;
  justify-content: center;
  height: 74px;
  gap: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background-color: var(--ypm-color-bg-primary);
}

.btn {
  height: 42px !important;
  padding: 4px 16px !important;
}

.historyBtn {
  color: var(--ypm-color-text-secondary) !important;

}
</style>
