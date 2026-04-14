<script setup lang="ts">
const { variant = 'primary', loading = false } = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'transparent'
  wide?: boolean
  disabled?: boolean
  loading?: boolean
}>()
</script>

<template>
  <button
    class="base-button"
    :class="[`is-${variant}`, wide && 'is-wide', loading && 'is-loading']"
    type="button"
    v-bind="$attrs"
    :disabled="loading || disabled"
  >
    <span
      v-if="loading"
      class="spinner"
    />
    <slot v-else />
  </button>
</template>

<style lang="scss">
.base-button {
  --b-height: 56px;
  --b-font-size: 16px;
  --b-border-radius: 10px;
  --b-transition: all 0.2s ease-in-out;

  --b-color-primary: var(--ypm-color-btn-main-bg);
  --b-color-primary-hover: var(--ypm-color-brand-dark);
  --b-color-primary-active: var(--ypm-color-brand-dark);

  --b-color-secondary: var(--ypm-color-btn-secondary-bg);
  --b-color-secondary-hover: var(--ypm-color-bg-tertiary);
  --b-color-secondary-active: var(--ypm-color-bg-tertiary);

  --b-color-danger: var(--ypm-color-state-error);
  --b-color-danger-hover: var(--ypm-color-state-error);
  --b-color-danger-active: var(--ypm-color-state-error);

  --b-color-transparent-hover: var(--ypm-color-bg-secondary);
  --b-color-transparent-active: var(--ypm-color-bg-tertiary);

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
    color: var(--ypm-color-btn-main-text);

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
    color: var(--ypm-color-btn-secondary-text);

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
    color: var(--ypm-color-btn-main-text);

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
    color: var(--ypm-color-btn-secondary-text);

    &:hover:not(:disabled) {
      background-color: var(--b-color-transparent-hover);
    }

    &:active:not(:disabled) {
      background-color: var(--b-color-transparent-active);
      transform: scale(0.98);
    }
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
  border: 2px solid transparent;
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.is-secondary .spinner,
.is-transparent .spinner {
  border-color: transparent;
  border-top-color: currentColor;
}

.base-button:focus-visible {
  box-shadow: 0 0 0 3px var(--ypm-color-brand-light);
}
</style>
