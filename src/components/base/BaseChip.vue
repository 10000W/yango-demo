<script setup lang="ts">
const { variant = 'info' } = defineProps<{
  variant?: 'info' | 'error' | 'warning' | 'success' | 'primary'
}>()
</script>

<template>
  <span :class="[$style.BaseChip, $style[`is-${variant}`]]">
    <slot />
  </span>
</template>

<style module lang="scss">
.BaseChip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1rem;
  white-space: nowrap;

  &.is-info,
  &.is-primary {
    background-color: oklch(from var(--c-primary) l c h / 10%);
    color: var(--c-primary);
  }

  &.is-error {
    background-color: oklch(from var(--c-danger) l c h / 10%);
    color: var(--c-danger);
  }

  &.is-warning {
    background-color: oklch(from var(--c-warning) l c h / 10%);
    color: var(--c-warning);
  }

  &.is-success {
    background-color: oklch(from var(--c-success) l c h / 10%);
    color: var(--c-success);
  }
}
</style>
