<script setup lang="ts">
import AssetOption from '@/components/entities/assets/AssetOption.vue'
import { type Asset, assets } from '@/entities/asset'
import { usePayment } from '@/composables/usePayment.ts'
import { useRouter } from 'vue-router'

const router = useRouter()
const { selectedAsset } = usePayment()

const onClickAsset = async (asset: Asset) => {
  selectedAsset.value = asset
  router.push('/pay')
}
</script>

<template>
  <div>
    <h1 :class="$style.title">
      Select asset
    </h1>
    <p :class="$style.description">
      Which asset you want to pay with
    </p>
    <ul :class="$style.list">
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
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}
</style>
