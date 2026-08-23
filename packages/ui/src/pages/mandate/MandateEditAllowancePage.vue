<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMandate } from '@/composables/useMandate'
import PageHeader from '@/components/PageHeader.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { EvmAsset } from '@tac-crypto-payment/sdk'
import { TronAsset } from '@tac-crypto-payment/sdk/asset/tron'

const router = useRouter()
const { allowanceAmount, isInfiniteAllowance, selectedAsset } = useMandate()

const localAmount = ref(allowanceAmount.value)
const localIsInfinite = ref(isInfiniteAllowance.value)

const error = ref('')

const assetSymbol = computed(() => {
  return (selectedAsset.value as EvmAsset | TronAsset)?.symbol || 'USDT'
})

const validate = () => {
  if (localIsInfinite.value) {
    error.value = ''
    return true
  }
  const val = parseFloat(localAmount.value)
  if (isNaN(val) || val <= 0) {
    error.value = 'Please enter a valid amount'
    return false
  }
  error.value = ''
  return true
}

const save = () => {
  if (!validate()) {
    return
  }
  allowanceAmount.value = localAmount.value
  isInfiniteAllowance.value = localIsInfinite.value
  router.back()
}
</script>

<template>
  <div class="column flex-1 gap-16">
    <PageHeader
      title="Edit permission"
      back-route="/asset"
    />

    <div class="column gap-24 flex-1">
      <div class="column gap-8">
        <p>
          Spending cap
        </p>
        <div>
          <BaseInput
            v-model="localAmount"
            :caption="assetSymbol"
            placeholder="200"
            maxlength="36"
            autocomplete="off"
            step="0.1"
            inputmode="decimal"
            :disabled="localIsInfinite"
            :error="error"
          />
        </div>

        <p class="c-text-secondary">
          We can charge up to this amount before you approve again.
        </p>
      </div>

      <div class="flex justify-between align-center gap-16">
        <div
          :class="[$style.switch, localIsInfinite && $style._active]"
          @click="localIsInfinite = !localIsInfinite"
        >
          <div :class="$style.switchThumb" />
        </div>

        <div class="column">
          <p class="p2">
            Infinite amount
          </p>
          <p class="p3 c-text-secondary">
            No limit for payments
          </p>
        </div>
      </div>
    </div>

    <BaseButton
      wide
      @click="save"
    >
      Save changes
    </BaseButton>
  </div>
</template>

<style module lang="scss">
.switch {
  width: 44px;
  height: 24px;
  background: var(--ypm-color-bg-tertiary);
  border: 1px solid var(--ypm-color-border-default);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;

  &._active {
    background: var(--ypm-color-brand-primary);
    border-color: var(--ypm-color-brand-primary);

    .switchThumb {
      left: 21px;
    }
  }
}

.switchThumb {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 1px;
  left: 1px;
  transition: left 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
