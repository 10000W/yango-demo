<script setup lang="ts">
const { variant = 'primary', size = 'medium', loading = false } = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'transparent'
  size?: 'small' | 'medium' | 'large'
  wide?: boolean
  disabled?: boolean
  loading?: boolean
}>()
</script>

<template>
  <button
    class="base-button"
    :class="[`is-${variant}`, `is-${size}`, wide && 'is-wide', loading && 'is-loading']"
    type="button"
    :disabled="loading || disabled"
  >
    <span v-if="loading" class="spinner" />
    <slot v-else />
  </button>
</template>

<style lang="scss">
.base-button {
  --b-height: 40px;
  --b-font-size: 16px;
  --b-border-radius: 8px;
  --b-transition: all 0.2s ease-in-out;

  --b-color-primary: var(--c-primary);
  --b-color-primary-hover: oklch(62% 0.28 285);
  --b-color-primary-active: oklch(58% 0.28 285);

  --b-color-secondary: var(--c-bg-mute);
  --b-color-secondary-hover: var(--c-border);
  --b-color-secondary-active: var(--c-border);

  --b-color-danger: var(--c-danger);
  --b-color-danger-hover: oklch(58% 0.26 29);
  --b-color-danger-active: oklch(54% 0.26 29);

  --b-color-transparent-hover: var(--c-bg-soft);
  --b-color-transparent-active: var(--c-bg-mute);

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  height: var(--b-height);
  font-size: var(--b-font-size);
  font-weight: 500;
  border-radius: var(--b-border-radius);
  border: none;
  cursor: pointer;
  transition: var(--b-transition);
  user-select: none;
  touch-action: manipulation;
  outline: none;

  &:disabled {
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
    color: var(--c-text);

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
    color: var(--c-text);

    &:hover:not(:disabled) {
      background-color: var(--b-color-transparent-hover);
    }

    &:active:not(:disabled) {
      background-color: var(--b-color-transparent-active);
      transform: scale(0.98);
    }
  }

  &.is-small {
    --b-font-size: 14px;
    --b-height: 32px;
  }

  &.is-large {
    --b-font-size: 18px;
    --b-height: 48px;
  }

  &.is-wide {
    width: 100%;
  }

  &.is-loading {
    cursor: wait;
    pointer-events: none;
  }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.is-secondary .spinner,
.is-transparent .spinner {
  border-color: oklch(from var(--c-text) l c h / 10%);
  border-top-color: var(--c-text);
}

.base-button:focus-visible {
  box-shadow: 0 0 0 3px oklch(from var(--c-primary) l c h / 40%);
}
</style>
