<script setup lang="ts">
import { computed } from 'vue'
import BaseChip from '@/components/base/BaseChip.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { Asset } from '@tac-crypto-payment/sdk'

const { asset } = defineProps<{
  gasless?: boolean
  asset: Asset & { gasless?: boolean }
}>()

const iconStyle = computed(() => {
  return {
    backgroundImage: `url("${asset.icon}")`,
  }
})

const chainColor = computed(() => {
  return 'chain' in asset ? asset.chain.color : null
})

const chainBgColor = computed(() => {
  return 'chain' in asset ? `oklch(from ${asset.chain.color} l c h / 15%)` : null
})
</script>

<template>
  <div
    :class="$style.AssetOption"
    class="gap-6 flex align-center"
  >
    <div
      v-if="asset.icon"
      :class="$style.icon"
      :style="iconStyle"
    />
    <div class="column gap-2 flex-1">
      <div class="p1 w-500 flex gap-6 align-center">
        {{ asset.symbol }}
        <BaseChip
          v-if="'chain' in asset"
          variant="primary"
          class="br-sm px-6 py-0"
          :class="$style.chainChip"
        >
          {{ asset.chain.name }}
        </BaseChip>
      </div>
      <p class="c-text-secondary">
        {{ asset.name }}
      </p>
    </div>
    <BaseChip
      v-if="asset.gasless"
      :class="$style.gasless"
      variant="success"
    >
      Gasless ⚡
    </BaseChip>
    <slot name="right">
      <BaseIcon
        name="chevron-right"
        class="c-text-primary"
      />
    </slot>
  </div>
</template>

<style module lang="scss">
.AssetOption {
  //padding: 8px 16px;
  padding: 12px 0;
}

.gasless {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.chainChip {
  font-weight: 600 !important;
  color: v-bind(chainColor) !important;
  background-color: v-bind(chainBgColor) !important;
}

.icon {
  margin: 6px;
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
