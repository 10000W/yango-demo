<script setup lang="ts">
import AssetOption from '@/components/assets/AssetOption.vue'
import { type Asset, evmAssets } from '@/entities/asset'
import { usePayment } from '@/composables/usePayment'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { computed } from 'vue'

const router = useRouter()
const { selectedChain, selectAsset } = usePayment()

const assets = computed(() => {
  if (selectedChain.value === 'evm') {
    return evmAssets
  }
  return []
})

const onClickAsset = async (asset: Asset) => {
  await selectAsset(asset)
  router.replace('/pay')
}
</script>

<template>
  <div>
    <PageHeader title="Select currency" />
    <ul
      :class="$style.list"
      class="column p-0"
    >
      <li
        v-for="asset in assets"
        :key="asset.name"
      >
        <AssetOption
          :asset="asset"
          :disabled="asset.disabled"
          @click="onClickAsset(asset)"
        />
      </li>
    </ul>
  </div>
</template>

<style module lang="scss">
.title {
  margin-bottom: 8px;
}

.description {
  color: var(--c-text-soft);
  margin-bottom: 24px;
}

.list {
  list-style: none;
  margin-top: 4px;

  & > *:not(:last-child) {
    border-bottom: 1px solid var(--ypm-color-border-default)
  }
}
</style>
