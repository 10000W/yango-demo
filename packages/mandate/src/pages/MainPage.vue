<script setup lang="ts">
import type { MandateConfig } from '../types'
import { type PaymentOption } from '@tac-crypto-payment/runtime'
import { computed, inject, ref } from 'vue'
import { useMandate } from '../useMandate'
import { usePaymentMethods } from '@tac-crypto-payment/runtime'
import { BaseIcon } from '@tac-crypto-payment/ui'
import { BaseButton } from '@tac-crypto-payment/ui'
import { PaymentOptionCard } from '@tac-crypto-payment/runtime'
import MethodSelectable from '../components/MethodSelectable.vue'
import { useAppKit } from '@tac-crypto-payment/runtime'
import { useRouter } from 'vue-router'
import { BaseBottomSheet } from '@tac-crypto-payment/ui'
import { paymentOptions } from '../entities/paymentOptions'

const config = inject<MandateConfig | null>('tacPaymentUiConfig', null)
const { isConnected: isEvmConnected, disconnect: disconnectEvm } = useAppKit()

const { mandate, selectedPaymentOption, revoke } = useMandate()
const { isPaymentMethodConnected } = usePaymentMethods()
const onCloseCallback = config?.onClose
const router = useRouter()

const isConfirmOpen = ref(false)
const confirmResolve = ref<((value: boolean) => void) | null>(null)
const pendingOption = ref<PaymentOption | null>(null)
const isRevokeConfirmOpen = ref(false)
const isRevoking = ref(false)
const revokeError = ref('')

const methods = computed(() => mandate.value?.methods || [])
const status = computed(() => mandate.value?.data.status || 'expired')
const activeMethodId = computed(() => mandate.value?.methods.find(m => m.isActive)?.id)

const confirmDisconnect = () => {
  isConfirmOpen.value = true
  return new Promise<boolean>((resolve) => {
    confirmResolve.value = resolve
  })
}
const handleConfirm = (value: boolean) => {
  isConfirmOpen.value = false
  if (confirmResolve.value) {
    confirmResolve.value(value)
    confirmResolve.value = null
  }
}
const handlePaymentOptionClick = async (option: PaymentOption) => {
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

const openRevokeConfirm = () => {
  revokeError.value = ''
  isRevokeConfirmOpen.value = true
}

const handleRevoke = async () => {
  revokeError.value = ''
  isRevoking.value = true

  try {
    await revoke()
    isRevokeConfirmOpen.value = false
  }
  catch (error) {
    revokeError.value = error instanceof Error ? error.message : 'Unable to cancel automatic payments.'
  }
  finally {
    isRevoking.value = false
  }
}
</script>

<template>
  <template v-if="status === 'active'">
    <div class="column gap-24">
      <div class="flex-1">
        <div
          :class="$style.title"
          class="flex justify-between align-end gap-8"
        >
          <h1 class="h1 mb-8 flex-1">
            Your methods
          </h1>
        </div>

        <MethodSelectable
          v-for="(method, key) in methods"
          :key="key"
          :method="method"
          :model-value="activeMethodId"
        />
      </div>

      <BaseButton
        variant="danger"
        wide
        @click="openRevokeConfirm"
      >
        Cancel automatic payments
      </BaseButton>

      <BaseBottomSheet
        v-model="isRevokeConfirmOpen"
        to=".tac-crypto-payment"
      >
        <div class="column align-center p-24">
          <div class="h2 mb-8 center">
            Stop automatic payments?
          </div>

          <div class="c-text-secondary mb-24 center">
            The app will no longer be able to charge you.
          </div>

          <p
            v-if="revokeError"
            class="c-text-error mb-24 center"
          >
            {{ revokeError }}
          </p>

          <div
            class="flex gap-12"
            :class="$style.confirmBtns"
          >
            <BaseButton
              class="flex-1"
              variant="danger"
              :loading="isRevoking"
              @click="handleRevoke"
            >
              Yes, cancel
            </BaseButton>
            <BaseButton
              class="flex-1"
              variant="secondary"
              :disabled="isRevoking"
              @click="isRevokeConfirmOpen = false"
            >
              Keep
            </BaseButton>
          </div>
        </div>
      </BaseBottomSheet>
    </div>
  </template>
  <template v-else-if="status === 'pending'">
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
            @click="handlePaymentOptionClick(o)"
          />
        </li>
      </ul>

      <BaseBottomSheet
        v-model="isConfirmOpen"
        to=".tac-crypto-payment"
        @close="handleConfirm(false)"
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
              @click="handleConfirm(false)"
            >
              Cancel
            </BaseButton>
            <BaseButton
              class="flex-1"
              variant="primary"
              @click="handleConfirm(true)"
            >
              Confirm
            </BaseButton>
          </div>
        </div>
      </BaseBottomSheet>
    </div>
  </template>
  <template v-else-if="status === 'expired' || status === 'revoked'">
    <div class="column">
      <div class="column align-center justify-center gap-16 center flex-1">
        <BaseIcon
          class="c-text-warning"
          :name="status === 'expired' ? 'expired' : 'important'"
          :size="60"
        />

        <h1 class="h1 center">
          <template v-if="status === 'expired'">
            Setup mandate expired
          </template>
          <template v-else-if="status === 'revoked'">
            Authorization cancelled
          </template>
        </h1>
        <p
          class="h4 center c-text-secondary"
          :class="$style.description"
        >
          <template v-if="status === 'expired'">
            Please create a new setup mandate session.
          </template>
          <template v-else-if="status === 'revoked'">
            Automatic payments are off.
            If you approved a spending allowance on-chain, you can also revoke it
            from your wallet for full peace of mind.
          </template>
        </p>
      </div>

      <BaseButton
        wide
        @click="onCloseCallback"
      >
        Close
      </BaseButton>
    </div>
  </template>
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
