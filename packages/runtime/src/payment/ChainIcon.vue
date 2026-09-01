<script setup lang="ts">
import { getAssetIconUrl, getChainIconUrl } from '../entities/asset'
import { computed } from 'vue'
import { Asset } from '@tac-crypto-payment/sdk'

const props = defineProps<{
  chain: string
  asset?: string | Asset
}>()

const chainIcon = computed(() => getChainIconUrl(props.chain))
const chainStyle = computed(() => ({
  backgroundImage: chainIcon.value ? `url("${chainIcon.value}")` : undefined,
}))
const assetIcon = computed(() => getAssetIconUrl(props.asset))
const assetStyle = computed(() => ({
  backgroundImage: assetIcon.value ? `url("${assetIcon.value}")` : undefined,
}))
</script>

<template>
  <div
    :class="$style.chain"
    :style="chainStyle"
  >
    <span v-if="!chainIcon">{{ chain.slice(0, 1).toUpperCase() }}</span>
    <div
      v-if="assetIcon"
      :class="$style.asset"
      :style="assetStyle"
    />
  </div>
</template>

<style module lang="scss">
.chain, .asset {
  background-color: var(--ypm-color-bg-primary);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 50%;
  border: 4px solid transparent;
  flex-shrink: 0;
}

.chain {
  position: relative;
  width: 54px;
  height: 54px;
}

.asset {
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 28px;
  height: 28px;
  border-color: var(--ypm-color-bg-primary);
}
</style>
