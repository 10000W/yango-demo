<script setup lang="ts">
import { useDeposit } from '../../composables/useDeposit'
import { BaseButton, BaseIcon } from '@tac-crypto-payment/ui'

const { deposit } = useDeposit()
</script>

<template>
  <div
    v-if="deposit"
    class="column gap-32"
  >
    <div class="column gap-16 center">
      <BaseIcon
        class="c-text-warning mx-auto"
        :size="66"
        name="expired"
      />
      <h1 :class="$style.title">
        The payment time <br>
        has expired
      </h1>
      <p class="c-text-secondary">
        If you have already submitted a transaction,
        do not create a new payment. The funds will be credited automatically.
      </p>
    </div>

    <div class="column gap-8">
      <BaseButton
        wide
        :href="deposit?.returnUrl || undefined"
        :disabled="!deposit?.returnUrl"
      >
        Return to Fleet
      </BaseButton>
    </div>
  </div>
</template>

<style module lang="scss">
.title {
  font-size: 46px !important;
  line-height: 56px !important;
  font-weight: 400 !important;
}

.link {
  text-decoration: none;
}
</style>
