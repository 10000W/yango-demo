<script setup lang="ts">
import { paymentOptions } from '../entities/paymentOptions'
import { PaymentOption, useAppKit, usePaymentMethods } from '@tac-crypto-payment/runtime'
import { BaseBottomSheet, BaseButton } from '@tac-crypto-payment/ui'
import { useMandate } from '../useMandate'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { PaymentOptionCard } from '@tac-crypto-payment/runtime'

const router = useRouter()
const { isConnected: isEvmConnected, disconnect: disconnectEvm } = useAppKit()
const { selectedPaymentOption } = useMandate()
const { isPaymentMethodConnected } = usePaymentMethods()
const pendingOption = ref<PaymentOption | null>(null)
const isConfirmOpen = ref(false)
const confirmResolve = ref<((value: boolean) => void) | null>(null)

const confirmDisconnect = () => {
  isConfirmOpen.value = true
  return new Promise<boolean>((resolve) => {
    confirmResolve.value = resolve
  })
}
const selectPaymentOption = async (option: PaymentOption) => {
  if (option.type === 'binance') {
    selectedPaymentOption.value = option
    router.push({ name: 'mandate.binance.form' })
    return
  }

  if (isEvmConnected.value && !isPaymentMethodConnected(option)) {
    pendingOption.value = option
    const confirmed = await confirmDisconnect()
    if (!confirmed) {
      return
    }
    await disconnectEvm()
  }

  selectedPaymentOption.value = option
  router.push({ name: 'mandate.connect' })
}
const handleConfirmDisconnect = (value: boolean) => {
  isConfirmOpen.value = false
  if (confirmResolve.value) {
    confirmResolve.value(value)
    confirmResolve.value = null
  }
}
</script>

<template>
  <div>
    <h1 class="h1 mb-8">
      Setup automatic payments
    </h1>

    <p class="c-text-secondary mb-8">
      This merchant wants to charge future orders automatically.
      Connect a crypto wallet once and approve a spending limit.
    </p>

    <ul
      :class="$style.list"
      class="column"
    >
      <li
        v-for="o in paymentOptions"
        :key="o.name"
      >
        <PaymentOptionCard
          :payment-option="o"
          :is-connected="isPaymentMethodConnected(o)"
          @click="selectPaymentOption(o)"
        />
      </li>
    </ul>

    <BaseBottomSheet
      v-model="isConfirmOpen"
      to=".tac-crypto-payment"
      @close="handleConfirmDisconnect(false)"
    >
      <div class="column align-center p-24">
        <div class="h2 mb-8 center">
          Switch wallet?
        </div>

        <div class="c-text-secondary mb-24 center">
          You are already connected with another wallet. Do you want to disconnect it and connect {{ pendingOption?.name }}?
        </div>

        <div
          class="flex gap-12"
          :class="$style.confirmBtns"
        >
          <BaseButton
            class="flex-1"
            variant="secondary"
            @click="handleConfirmDisconnect(false)"
          >
            Cancel
          </BaseButton>
          <BaseButton
            class="flex-1"
            variant="primary"
            @click="handleConfirmDisconnect(true)"
          >
            Confirm
          </BaseButton>
        </div>
      </div>
    </BaseBottomSheet>
  </div>
</template>

<style module lang="scss">
.title {
  width: 100%;
  margin: 0;
}

.list {
  list-style: none;
  padding: 0;

  & > *:not(:last-child) {
    border-bottom: 1px solid var(--ypm-color-border-default)
  }
}

.confirmBtns {
  width: 100%;
}
</style>
