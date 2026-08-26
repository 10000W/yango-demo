<script setup lang="ts">
const { max = 100 } = defineProps<{
  max?: number
}>()

const model = defineModel<number>({ default: 0 })
</script>

<template>
  <div :class="$style.BaseProgress">
    <div
      :class="$style.fill"
      :style="{ width: `${Math.min(100, Math.max(0, (model / max) * 100))}%` }"
    />
  </div>
</template>

<style lang="scss" module>
.BaseProgress {
  --bp-height: 4px;
  --bp-bg: var(--ypm-color-bg-secondary);
  --bp-fill: var(--ypm-color-brand-primary);
  --bp-border-radius: 999px;
  --bp-transition: width 0.2s ease-in-out;

  width: 100%;
  height: var(--bp-height);
  background-color: var(--bp-bg);
  border-radius: var(--bp-border-radius);
  overflow: hidden;
  position: relative;
}

.fill {
  height: 100%;
  background-color: var(--bp-fill);
  border-radius: var(--bp-border-radius);
  transition: var(--bp-transition);
}
</style>
