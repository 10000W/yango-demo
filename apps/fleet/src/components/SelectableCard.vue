<script setup lang="ts">
import { BaseRadio } from '@tac-crypto-payment/ui'
import { computed } from 'vue'

const props = defineProps<{
  name: string
  label: string
  value: string | number
  vertical?: boolean
  icon?: string
}>()

const model = defineModel<string | number>()
const isActive = computed(() => model.value === props.value)
</script>

<template>
  <label
    :class="[$style.SelectableCard, {[$style._vertical]: vertical, [$style._active]: isActive}]"
    class="gap-12"
  >
    <div :class="$style.icon">
      <img
        v-if="icon"
        :src="icon"
        width="36"
        height="36"
        :alt="label"
      >
    </div>
    <div :class="$style.name">
      {{ label }}
    </div>

    <div
      :class="$style.radio"
      class="justify-self-end"
    >
      <BaseRadio
        v-model="model"
        :name
        :value
      />
    </div>
  </label>
</template>

<style module lang="scss">
.SelectableCard {
  display: grid;
  padding: 12px 16px;
  border-radius: 10px;
  align-items: center;
  grid-template-columns: 36px 1fr auto;
  background-color: var(--ypm-color-btn-secondary-bg);

  &._vertical {
    align-items: start;
    grid-template-columns: 1fr auto;
    padding: 16px;

    .icon { grid-area: 1 / 1 / 2 / 2; }
    .name { grid-area: 2 / 1 / 3 / 2; }
    .radio { grid-area: 1 / 2 / 3 / 3; }
  }

  &._active {
    background-color: color-mix(in srgb, var(--ypm-color-btn-secondary-bg) 70%, white 15%);

    @media (prefers-color-scheme: light) {
      background-color: color-mix(in srgb, var(--ypm-color-btn-secondary-bg) 70%, black 10%);
    }
  }
}

.icon {
  width: 36px;
  height: 36px;

  img {
    display: block;
  }
}

.icon { grid-area: 1 / 1 / 2 / 2; }
.name { grid-area: 1 / 2 / 2 / 3; }
.radio { grid-area: 1 / 3 / 2 / 4; }
</style>
