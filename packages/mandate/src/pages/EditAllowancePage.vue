<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMandate } from '../useMandate'
import { PageHeader } from '@tac-crypto-payment/runtime'
import { BaseButton, BaseInput, BaseSwitch } from '@tac-crypto-payment/ui'

const router = useRouter()
const { allowanceAmount, isInfiniteAllowance, selectedAsset } = useMandate()

const assetSymbol = computed(() => selectedAsset.value?.symbol || 'UKWN')
const localAmount = ref(allowanceAmount.value)
const localIsInfinite = ref(isInfiniteAllowance.value)
const error = ref('')

const save = () => {
  if (!localIsInfinite.value && (!Number.isFinite(Number(localAmount.value)) || Number(localAmount.value) <= 0)) {
    error.value = 'Please enter a valid amount'
    return
  }

  error.value = ''
  allowanceAmount.value = localAmount.value
  isInfiniteAllowance.value = localIsInfinite.value
  router.back()
}
</script>

<template>
  <div class="column flex-1 gap-16">
    <PageHeader
      title="Edit permission"
      :back-route="{ name: 'mandate.asset' }"
    />

    <div class="column gap-24 flex-1">
      <div class="column gap-8">
        <p>Spending cap</p>
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
        <p class="c-text-secondary">
          We can charge up to this amount before you approve again.
        </p>
      </div>

      <div class="flex justify-between align-center gap-16">
        <BaseSwitch
          v-model="localIsInfinite"
          aria-label="Infinite amount"
        />
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
