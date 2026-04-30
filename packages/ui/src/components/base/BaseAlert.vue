<script setup lang="ts">
import BaseIcon from '@ui/components/base/BaseIcon.vue'

const { icon = 'important', variant = 'info' } = defineProps<{
  icon?: string
  variant?: 'error' | 'warning' | 'success'
}>()
</script>

<template>
  <div
    :class="[$style.BaseAlert, $style[`is-${variant}`]]"
    class="flex p3 align-center p-12 br-md gap-10"
  >
    <BaseIcon
      :class="$style.icon"
      class="c-text-primary"
      :name="icon"
    />

    <div :class="$style.content">
      <slot />
    </div>
  </div>
</template>

<style module lang="scss">
.BaseAlert {
  width: 100%;
  background-color: var(--ypm-color-bg-secondary);

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
  flex-shrink: 0;
}

.content {
  flex: 1;
}
</style>
