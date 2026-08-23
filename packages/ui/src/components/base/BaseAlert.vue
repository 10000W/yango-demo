<script setup lang="ts">
import BaseIcon from '@/components/base/BaseIcon.vue'

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

  .icon {
    color: var(--ypm-color-brand-primary);
  }

  &.is-error {
    background-color: oklch(from var(--ypm-color-state-error) l c h / 10%);
    color: var(--ypm-color-state-error);

    .icon {
      color: inherit
    }
  }

  &.is-warning {
    background-color: oklch(from var(--ypm-color-state-warning) l c h / 10%);
    color: var(--ypm-color-state-warning);

    .icon {
      color: inherit
    }
  }

  &.is-success {
    background-color: oklch(from var(--ypm-color-state-success) l c h / 10%);
    color: var(--ypm-color-state-success);

    .icon {
      color: inherit
    }
  }
}

.icon {
  flex-shrink: 0;
}

.content {
  flex: 1;
}
</style>
