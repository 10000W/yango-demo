<script setup lang="ts">
const { variant = 'primary', size = 'medium' } = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'transparent'
  size?: 'small' | 'medium' | 'large'
}>()
</script>

<template>
  <button
    class="base-button"
    :class="[`is-${variant}`, `is-${size}`]"
    type="button"
  >
    <slot />
  </button>
</template>

<style lang="scss">
.base-button {
  --b-padding-y: 12px;
  --b-padding-x: 20px;
  --b-font-size: 16px;
  --b-border-radius: 8px;
  --b-transition: all 0.2s ease-in-out;

  --b-color-primary: var(--c-yango-purple, #7137ff);
  --b-color-primary-hover: #5a2bcc;
  --b-color-primary-active: #4a24a6;

  --b-color-secondary: #f0f0f0;
  --b-color-secondary-hover: #e0e0e0;
  --b-color-secondary-active: #d0d0d0;

  --b-color-danger: var(--c-yango-red, #ff1a1a);
  --b-color-danger-hover: #e61717;
  --b-color-danger-active: #cc1414;

  --b-color-transparent-hover: #f0f0f0;
  --b-color-transparent-active: #e0e0e0;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--b-padding-y) var(--b-padding-x);
  font-size: var(--b-font-size);
  font-weight: 400;
  border-radius: var(--b-border-radius);
  border: none;
  cursor: pointer;
  transition: var(--b-transition);
  user-select: none;
  touch-action: manipulation;
  outline: none;

  &[disabled="disabled"] {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.is-primary {
    background-color: var(--b-color-primary);
    color: white;

    &:hover:not(:disabled) {
      background-color: var(--b-color-primary-hover);
    }

    &:active:not(:disabled) {
      background-color: var(--b-color-primary-active);
      transform: scale(0.98);
    }
  }

  &.is-secondary {
    background-color: var(--b-color-secondary);
    color: #333;

    &:hover:not(:disabled) {
      background-color: var(--b-color-secondary-hover);
    }

    &:active:not(:disabled) {
      background-color: var(--b-color-secondary-active);
      transform: scale(0.98);
    }
  }

  &.is-danger {
    background-color: var(--b-color-danger);
    color: white;

    &:hover:not(:disabled) {
      background-color: var(--b-color-danger-hover);
    }

    &:active:not(:disabled) {
      background-color: var(--b-color-danger-active);
      transform: scale(0.98);
    }
  }

  &.is-transparent {
    background-color: transparent;
    color: #333;

    &:hover:not(:disabled) {
      background-color: var(--b-color-transparent-hover);
    }

    &:active:not(:disabled) {
      background-color: var(--b-color-transparent-active);
      transform: scale(0.98);
    }
  }

  &.is-small {
    --b-padding-y: 8px;
    --b-padding-x: 16px;
    --b-font-size: 14px;
  }

  &.is-large {
    --b-padding-y: 16px;
    --b-padding-x: 24px;
    --b-font-size: 18px;
  }
}

.base-button:focus-visible {
  box-shadow: 0 0 0 3px rgba(113, 55, 255, 0.4);
}
</style>
