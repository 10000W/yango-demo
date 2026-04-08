<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import type { Asset } from '@/entities/asset'

const { asset } = defineProps<{
  asset: Asset
}>()

const iconStyle = computed(() => {
  return {
    backgroundImage: `url("${asset.icon}")`,
  }
})
</script>

<template>
  <BaseButton
    variant="secondary"
    :class="$style.AssetOption"
  >
    <div :class="$style.content">
      <div
        v-if="asset.icon"
        :class="$style.icon"
        :style="iconStyle"
      />
      <span :class="$style.info">
        <span :class="$style.name">{{ asset.name }}</span>
      </span>
    </div>
  </BaseButton>
</template>

<style module lang="scss">
.AssetOption {
  width: 100%;
}

.content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  width: 100%;
  gap: 12px;
}

.icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-left: -4px;
}

.info {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  color: #333;
}

.description {
  font-size: 0.75rem;
  color: #666;
  line-height: 1rem;
}
</style>
