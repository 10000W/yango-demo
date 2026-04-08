<script setup lang="ts">
import AssetOption from '@/components/entities/assets/AssetOption.vue'
import { type Asset, assets } from '@/entities/asset'
import { usePayment } from '@/composables/usePayment.ts'
import { useRouter } from 'vue-router'

const router = useRouter()
const { selectedChain, selectedAsset } = usePayment()

const onClickAsset = async (asset: Asset) => {
  selectedAsset.value = asset
  router.push('/pay')
}
</script>

<template>
  <h1>
    Select asset
  </h1>
  <p>
    Which asset you want to pay with
  </p>
  <p v-if="selectedChain">
    Selected chain: {{ selectedChain }}
  </p>
  <ul :class="$style.list">
    <li
      v-for="asset in assets"
      :key="asset.name"
    >
      <AssetOption
        :asset="asset"
        @click="onClickAsset(asset)"
      />
    </li>
  </ul>
</template>

<style module lang="scss">
.list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}
</style>
