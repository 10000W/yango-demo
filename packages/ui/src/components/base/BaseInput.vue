<script setup lang="ts">
import { ref } from 'vue'
defineProps<{
  label?: string
  caption?: string
  error?: string | boolean
}>()

defineOptions({ inheritAttrs: false })

const model = defineModel<string>()

const isFocused = ref(false)
</script>

<template>
  <div class="column gap-8">
    <div :class="[$style.BaseInput, error && $style._error, isFocused && $style._focused]">
      <label
        v-if="label"
        class="p3 c-text-secondary"
      >
        {{ label }}
      </label>

      <label :class="$style.wrapper">
        <input
          v-model="model"
          v-bind="$attrs"
          :class="$style.input"
          @focus="isFocused = true"
          @blur="isFocused = false"
        >

        <span
          v-if="caption"
          :class="$style.caption"
        >
          {{ caption }}
        </span>
      </label>
    </div>

    <span
      v-if="typeof error === 'string' && error"
      class="p3 c-text-error"
    >
      {{ error }}
    </span>
  </div>
</template>

<style lang="scss" module>
.BaseInput {
  font-size: 16px;
  border-radius: 12px;
  border: 1px solid var(--ypm-color-border-default);
  background: var(--ypm-color-bg-tertiary);

  &._focused {
    outline: 1px solid var(--ypm-color-brand-primary);
  }

  &._error {
    .wrapper {
      border-color: var(--ypm-color-state-error);
    }
  }
}

.input {
  color: var(--ypm-color-text-primary);
  width: 100%;
  height: 46px;
  padding: 0 12px;
  border-radius: inherit;
  transition: border-color 0.2s ease;
  font-size: inherit;
  appearance: none;
  background-color: transparent;
  border: none;
  outline: none;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--ypm-color-text-secondary);
    opacity: 0.5;
  }
}

.wrapper {
  display: flex;
  align-items: center;
  border-radius: inherit;
}

.caption {
  color: var(--ypm-color-text-secondary);
  pointer-events: none;
  margin: 0 20px 0 0;
}
</style>
