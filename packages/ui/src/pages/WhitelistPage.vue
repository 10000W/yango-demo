<script setup lang="ts">
import BaseButton from '@ui/components/base/BaseButton.vue'
import BaseIcon from '@ui/components/base/BaseIcon.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div
    :class="$style.WhitelistPage"
    class="column align-center between gap-16 center"
  >
    <div class="column flex-1 align-center justify-center">
      <BaseIcon
        :class="$style.icon"
        name="success"
        :size="60"
      />
      <h1 class="h1 center mb-8">
        You’ve applied to whitelist
      </h1>
      <p
        class="h4 center c-text-secondary"
        :class="$style.description"
      >
        We will contact you via Email <br>as soon as the card is available.
      </p>
    </div>

    <BaseButton
      wide
      @click="router.replace('/')"
    >
      Return to the payment
    </BaseButton>
  </div>
</template>

<style module lang="scss">
.WhitelistPage {
  height: 100%;

  --ypm-color-brand-primary: #FF1A1A;
  --ypm-color-btn-main-bg: #FF1A1A;
}

.icon {
  color: var(--ypm-color-state-success);
}
</style>
