<script setup lang="ts">
import BaseIcon from '@ui/components/base/BaseIcon.vue'

const { square, variant = 'info' } = defineProps<{
  variant?: 'info' | 'error' | 'warning' | 'success' | 'primary'
  square?: boolean
  icon?: string
}>()
</script>

<template>
  <span :class="[$style.BaseChip, $style[`is-${variant}`], { [$style['is-square']]: square }]">
    <BaseIcon
      v-if="icon"
      :name="icon"
      size="18"
    />
    <slot />
  </span>
</template>

<style module lang="scss">
.BaseChip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  gap: 4px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;

  &.is-info,
  &.is-primary {
    background-color: oklch(from var(--ypm-color-brand-primary) l c h / 10%);
    color: var(--ypm-color-brand-primary);
  }

  &.is-error {
    background-color: oklch(from var(--ypm-color-state-error) l c h / 10%);
    color: var(--ypm-color-state-error);
  }

  &.is-warning {
    background-color: oklch(from var(--ypm-color-state-warning) l c h / 10%);
    color: var(--ypm-color-state-warning);
  }

  &.is-success {
    background-color: oklch(from var(--ypm-color-state-success) l c h / 10%);
    color: var(--ypm-color-state-success);
  }

  &.is-square {
    padding: 0;
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }
}
</style>
