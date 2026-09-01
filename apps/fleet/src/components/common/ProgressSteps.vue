<script setup lang="ts">
import ProgressStep, { type Step } from './ProgressStep.vue'
import { BaseProgress } from '@tac-crypto-payment/ui'

defineProps<{ steps: Step[], failed?: boolean }>()

const model = defineModel<number>({ default: 0 })
</script>

<template>
  <div
    :class="$style.ProgressSteps"
    class="flex gap-16 between"
  >
    <template
      v-for="(step, idx) in steps"
      :key="idx"
    >
      <ProgressStep
        :step
        :active="step.value === model"
        :completed="step.value < model"
        :failed="failed && step.value === model"
      />
      <template v-if="idx < steps.length - 1">
        <BaseProgress
          :class="$style.progress"
          :model-value="step.value < model ? 1 : step.value - 1 < model ? 0.5 : 0"
          :max="1"
        />
      </template>
    </template>
  </div>
</template>

<style module lang="scss">
.ProgressSteps {
  //
}

.progress {
  position: relative;
  top: 14px;
}
</style>
