<script setup lang="ts">
import { ChainIcon } from '@tac-crypto-payment/runtime'
import { formatNumber, truncate } from '@tac-crypto-payment/runtime'
import type { PayZapMandateSetupDataMethod } from '@tac-crypto-payment/sdk'
import { computed } from 'vue'

const { method } = defineProps<{ method: PayZapMandateSetupDataMethod, active?: boolean }>()

const networkNames: Record<PayZapMandateSetupDataMethod['network'], string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  bsc: 'BSC',
  arbitrum: 'Arbitrum',
  base: 'Base',
  tron: 'Tron',
}

const name = computed(() => method.kind === 'tron_wallet' ? 'Tron Wallet' : 'EVM Wallet')
const network = computed(() => networkNames[method.network])
const cap = computed(() => Number(method.capUnits) / 10 ** method.tokenDecimals)
</script>

<template>
  <div class="flex gap-16 align-center">
    <ChainIcon
      :chain="method.network"
      :asset="method.tokenSymbol"
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
      <p class="flex align-center gap-8 c-text-secondary">
        {{ network }}
        <svg
          width="4"
          height="4"
          viewBox="0 0 4 4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="2"
            cy="2"
            r="2"
            fill="#3D294C"
          />
        </svg>
        Cap {{ formatNumber(cap) }} {{ method.tokenSymbol }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
