<script setup lang="ts">
import BaseIcon from '@/components/base/BaseIcon.vue'
import { computed } from 'vue'

const { value, type = 'radio' } = defineProps<{
  value: string
  type?: 'radio' | 'checkbox'
}>()
const model = defineModel<string>()
const isActive = computed(() => model.value === value)
</script>

<template>
  <div
    class="base-radio"
    :class="{'base-radio--active': isActive}"
  >
    <input
      v-model="model"
      :type
      :value="value"
      v-bind="$attrs"
      tabindex="0"
    >

    <div class="base-radio__dot">
      <BaseIcon
        :size="18"
        class="base-radio__check"
        name="check"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-radio {
  $root: &;
  position: relative;

  & input {
    appearance: none;
    opacity: 0;
    position: absolute;
  }

  &__dot {
    position: relative;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ypm-color-btn-main-text);
    border: 1px solid var(--ypm-color-bg-secondary);
  }

  &__check {
    opacity: 0;
  }

  &--active {
    #{$root}__dot {
      background: var(--ypm-color-brand-primary);
      border-color: var(--ypm-color-brand-primary);
    }

    #{$root}__check {
      opacity: 1;
    }
  }
}
</style>
