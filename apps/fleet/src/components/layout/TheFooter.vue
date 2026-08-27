<script setup lang="ts">
import { BaseIcon } from '@tac-crypto-payment/ui'
</script>

<template>
  <footer
    :class="$style.TheFooter"
    class="flex justify-center"
  >
    <div class="container">
      <small class="flex align-center justify-center gap-6 c-text-secondary p3 w-500 p-24">
        <BaseIcon
          :size="22"
          name="tac"
        />
        Powered by TAC
      </small>
    </div>
  </footer>
</template>

<style module lang="scss">
.TheFooter {
  width: 100%;
}
</style>
