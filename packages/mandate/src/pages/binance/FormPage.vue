<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMandate } from '../../useMandate'
import { PageHeader } from '@tac-crypto-payment/runtime'
import { BaseAlert, BaseButton } from '@tac-crypto-payment/ui'
import { BaseInput } from '@tac-crypto-payment/ui'
import { ServiceError } from '@tac-crypto-payment/sdk'
import { paymentOptions } from '../../entities/paymentOptions'

const router = useRouter()
const { binance, selectedPaymentOption, approve, updateMandate } = useMandate()

const isSubmitting = ref(false)
const localAmount = ref(binance.value.amount)
const amountError = ref('')
const error = ref('')

const validate = () => {
  const val = parseFloat(localAmount.value)
  if (isNaN(val) || val <= 0) {
    error.value = 'Please enter a valid amount'
    return false
  }
  error.value = ''
  return true
}
const next = async () => {
  try {
    isSubmitting.value = true
    if (!validate()) {
      amountError.value = 'Please enter a valid amount'
      return
    }
    if (!selectedPaymentOption.value) {
      selectedPaymentOption.value = paymentOptions.find(o => o.type === 'binance')!
    }
    binance.value.amount = localAmount.value
    await approve()
    await updateMandate()
    router.replace({ name: 'mandate.binance.confirm' })
  }
  catch (e) {
    console.warn(e)
    if (e instanceof ServiceError) {
      error.value = e.message
    }
    else if (e instanceof Error) {
      error.value = e.message
    }
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="column flex-1 gap-16">
    <PageHeader
      title="Binance Pay"
      :back-route="{ name: 'mandate.start' }"
    />

    <p class="c-text-secondary">
      Authorize automatic deductions from your Binance account.
      You approve once, with a limit per payment - no confirmations after that.
    </p>

    <form
      class="column flex-1 gap-16"
      @submit.prevent="next()"
    >
      <div class="column gap-24 flex-1">
        <div class="column gap-8">
          <p>
            Limit per payment
          </p>
          <div>
            <BaseInput
              v-model="localAmount"
              caption="USDT"
              placeholder="200"
              maxlength="36"
              autocomplete="off"
              step="0.1"
              inputmode="decimal"
              :error="amountError"
            />
          </div>

          <p class="c-text-secondary">
            No single payment can exceed this.
            You can cancel the authorization any time - here or in the Binance app.
          </p>
        </div>
      </div>

      <BaseAlert
        v-if="error"
        variant="error"
      >
        {{ error }}
      </BaseAlert>

      <BaseButton
        wide
        :disabled="isSubmitting"
        :loading="isSubmitting"
        type="submit"
      >
        Continue with Binance
      </BaseButton>
    </form>
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
  }
}

</style>
