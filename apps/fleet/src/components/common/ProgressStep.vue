<script setup lang="ts">
import { BaseIcon } from '@tac-crypto-payment/ui'

export type Step = {
  label: string
  value: number
}
defineProps<{ step: Step, active?: boolean, completed?: boolean, failed?: boolean }>()
</script>

<template>
  <div
    class="column align-center"
    :class="[$style.ProgressStep, { [$style._active]: active }, { [$style._completed]: completed }]"
  >
    <div
      :class="$style.index"
      class="center flex align-center justify-center mb-8"
    >
      <BaseIcon
        v-if="failed || completed"
        :name="failed ? 'cross' : 'check'"
        :size="18"
      />
      <template v-else>
        {{ step.value }}
      </template>
    </div>

    <p>
      {{ step.label || 'Test' }}
    </p>
  </div>
</template>

<style module lang="scss">
.ProgressStep {
  &._active,
  &._completed {
    .index {
      background-color: var(--ypm-color-brand-primary);
    }
  }

  &._active {
    .index {
      &:before {
        border-color: var(--ypm-color-brand-primary);
      }
    }
  }
}

.index {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--ypm-color-btn-secondary-bg);

  &:before {
    content: "";
    position: absolute;
    left: -5px;
    top: -5px;
    border-radius: inherit;
    border: 2px solid transparent;
    width: calc(100% + 10px);
    height: calc(100% + 10px);
  }
}
</style>
