<script setup lang="ts">
import { ChainIcon } from '@tac-crypto-payment/runtime'
import type { PayZapMandateSetupDataMethod } from '@tac-crypto-payment/sdk'
import binanceIcon from '../public/images/payment/binance.png?url'

const { method, size = 54 } = defineProps<{
  method: PayZapMandateSetupDataMethod
  size?: number
}>()
</script>

<template>
  <div
    v-if="method.kind === 'binance_pay'"
    :class="$style.binance"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      backgroundImage: `url(${binanceIcon})`,
    }"
  />
  <ChainIcon
    v-else
    :chain="method.network"
    :asset="method.tokenSymbol"
    :size="size"
  />
</template>

<style module lang="scss">
.binance {
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  flex-shrink: 0;
}
</style>
