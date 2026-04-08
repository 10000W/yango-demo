<script setup lang="ts">
const { icon, variant = 'info' } = defineProps<{
  icon?: string
  variant?: 'info' | 'error' | 'warning' | 'success'
}>()
</script>

<template>
  <div :class="[$style.BaseAlert, $style[`is-${variant}`]]">
    <img
      v-if="icon"
      :src="icon"
      :class="$style.icon"
      alt="alert icon"
    >
    <div :class="$style.content">
      <slot />
    </div>
  </div>
</template>

<style module lang="scss">
.BaseAlert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 20px;
  width: 100%;

  &.is-info {
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

.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.content {
  flex: 1;
}
</style>
