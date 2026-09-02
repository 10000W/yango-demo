<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseInput, BaseSwitch } from '@tac-crypto-payment/ui'
import { isInfiniteAllowanceAmount } from '../entities/allowance'

type AllowanceValues = {
  amount: string
  isInfinite: boolean
}

const { amount, isInfinite, assetSymbol, submitLabel = 'Save changes', onSubmit } = defineProps<{
  amount: string
  isInfinite: boolean
  assetSymbol: string
  submitLabel?: string
  onSubmit: (values: AllowanceValues) => void | Promise<void>
}>()

const localAmount = ref(amount)
const localIsInfinite = ref(isInfinite || isInfiniteAllowanceAmount(amount))
const error = ref('')
const isSubmitting = ref(false)

const submit = async () => {
  if (!localIsInfinite.value) {
    const value = parseFloat(localAmount.value)
    if (isNaN(value) || value <= 0) {
      error.value = 'Please enter a valid amount'
      return
    }
  }

  error.value = ''
  isSubmitting.value = true
  try {
    await onSubmit({
      amount: localAmount.value,
      isInfinite: localIsInfinite.value,
    })
  }
  catch (submitError) {
    error.value = submitError instanceof Error ? submitError.message : 'Unable to save permission changes.'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="column gap-24 flex-1">
    <div class="column gap-8">
      <p>
        Spending cap
      </p>
      <BaseInput
        v-model="localAmount"
        :caption="assetSymbol"
        placeholder="200"
        maxlength="36"
        autocomplete="off"
        step="0.1"
        inputmode="decimal"
        :disabled="localIsInfinite || isSubmitting"
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
        :disabled="isSubmitting"
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

    <BaseButton
      wide
      :loading="isSubmitting"
      @click="submit"
    >
      {{ submitLabel }}
    </BaseButton>
  </div>
</template>
