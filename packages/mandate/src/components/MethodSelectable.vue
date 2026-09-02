<script setup lang="ts">
import { BaseIcon, BaseRadio } from '@tac-crypto-payment/ui'
import { PayZapMandateSetupDataMethod } from '@tac-crypto-payment/sdk'
import MethodInfo from './MethodInfo.vue'

const { method, loading = false } = defineProps<{
  method: PayZapMandateSetupDataMethod
  loading?: boolean
}>()
const model = defineModel<string>()
</script>

<template>
  <div class="flex gap-16 align-center">
    <label class="flex gap-16 align-center flex-1">
      <BaseRadio
        v-model="model"
        :disabled="loading"
        name="mandate-method"
        :value="method.id"
      />

      <MethodInfo
        :method="method"
        :active="method.isActive"
      />
    </label>

    <button
      type="button"
      :class="$style.iconWrap"
      class="flex"
      :disabled="loading"
      @click.stop="$router.push({ name: 'mandate.method.edit', params: { methodId: method.id } })"
    >
      <BaseIcon
        :class="$style.icon"
        class="c-text-primary"
        :name="loading ? 'loading' : 'pencil'"
      />
    </button>
  </div>
</template>

<style module lang="scss">
.icon {
  color: var(--ypm-color-text-primary);
}

.iconWrap {
  align-items: center;
  justify-content: end;
  min-height: 40px;
  min-width: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  appearance: none;

  &:disabled {
    cursor: not-allowed;
  }
}
</style>
