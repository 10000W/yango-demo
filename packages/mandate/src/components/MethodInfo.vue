<script setup lang="ts">
import { formatNumber, truncate } from '@tac-crypto-payment/runtime'
import type { PayZapMandateSetupDataMethod } from '@tac-crypto-payment/sdk'
import { computed } from 'vue'
import { getMethodName } from '../entities/method'
import { isInfiniteAllowanceCap } from '../entities/allowance'
import MethodIcon from './MethodIcon.vue'

const { method, iconSize = 54 } = defineProps<{ method: PayZapMandateSetupDataMethod, active?: boolean, iconSize?: number }>()

const name = computed(() => getMethodName(method))
const cap = computed(() => Number(method.capUnits) / 10 ** method.tokenDecimals)
const isInfiniteCap = computed(() => isInfiniteAllowanceCap(method.capUnits, method.tokenDecimals))
</script>

<template>
  <div class="flex gap-16 align-center">
    <MethodIcon
      :method="method"
      :size="iconSize"
    />

    <div class="column gap-2">
      <p class="w-500 p1">
        {{ name }}
      </p>

      <p v-if="method.customerWallet">
        <span class="p3 mono c-text-secondary">
          {{ truncate(method.customerWallet) }}
        </span>
      </p>
      <p
        v-if="method.kind === 'binance_pay'"
        class="p3 c-text-secondary"
      >
        Connected
      </p>
      <p
        v-else
        class="flex align-center gap-8 c-text-secondary"
      >
        <template v-if="isInfiniteCap">
          Cap: Unlimited
        </template>
        <template v-else>
          Cap: {{ formatNumber(cap) }}
        </template>
        {{ method.tokenSymbol }}
      </p>
    </div>
  </div>
</template>
