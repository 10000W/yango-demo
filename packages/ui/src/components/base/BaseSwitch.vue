<script setup lang="ts">
const { disabled = false } = defineProps<{
  disabled?: boolean
}>()

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label
    class="base-switch"
    :class="{ 'is-active': model, 'is-disabled': disabled }"
  >
    <input
      v-model="model"
      type="checkbox"
      :disabled="disabled"
      v-bind="$attrs"
    >
    <span class="base-switch__thumb" />
  </label>
</template>

<style scoped lang="scss">
.base-switch {
  --b-switch-width: 44px;
  --b-switch-height: 24px;
  --b-switch-thumb-size: 20px;
  --b-switch-bg: var(--ypm-color-bg-tertiary);
  --b-switch-border-color: var(--ypm-color-border-default);
  --b-switch-active-bg: var(--ypm-color-brand-primary);
  --b-switch-active-border-color: var(--ypm-color-brand-primary);
  --b-switch-thumb-bg: white;

  display: block;
  position: relative;
  width: var(--b-switch-width);
  height: var(--b-switch-height);
  flex-shrink: 0;
  cursor: pointer;

  input {
    position: absolute;
    opacity: 0;
    inset: 0;
    margin: 0;
    cursor: inherit;
  }

  &__thumb {
    position: absolute;
    top: calc((var(--b-switch-height) - var(--b-switch-thumb-size)) / 2);
    left: calc((var(--b-switch-height) - var(--b-switch-thumb-size)) / 2);
    width: var(--b-switch-thumb-size);
    height: var(--b-switch-thumb-size);
    border-radius: 50%;
    background: var(--b-switch-thumb-bg);
    box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
    transition: left .2s ease;
  }

  &::before {
    position: absolute;
    inset: 0;
    border: 1px solid var(--b-switch-border-color);
    border-radius: calc(var(--b-switch-height) / 2);
    background: var(--b-switch-bg);
    content: '';
    transition: all .2s ease;
  }

  &.is-active {
    &::before {
      background: var(--b-switch-active-bg);
      border-color: var(--b-switch-active-border-color);
    }

    .base-switch__thumb {
      left: calc(var(--b-switch-width) - var(--b-switch-thumb-size) - (var(--b-switch-height) - var(--b-switch-thumb-size)) / 2);
    }
  }

  &.is-disabled {
    cursor: not-allowed;
    opacity: .5;
  }
}
</style>
