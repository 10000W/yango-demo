<script setup lang="ts">
import type { MandateConfig } from '../types'
import { computed, inject, ref, type Ref } from 'vue'
import { useMandate } from '../useMandate'
import { BaseIcon } from '@tac-crypto-payment/ui'
import { BaseButton } from '@tac-crypto-payment/ui'
import MethodSelectable from '../components/MethodSelectable.vue'
import { BaseAlert } from '@tac-crypto-payment/ui'
import { useRouter } from 'vue-router'
// import CancelAllPaymentsButton from '../components/CancelAllPaymentsButton.vue'
import { useDebounceFn, useTimeoutFn } from '@vueuse/core'

const config = inject<MandateConfig | null>('tacPaymentUiConfig', null)

const { mandate, status, activateMethod } = useMandate()
const onCloseCallback = config?.onClose

const router = useRouter()
const pendingMethodId: Ref<string | undefined> = ref(undefined)
const isActivatingMethod = ref(false)
const isActivationDebounced = ref(false)
const activationMessage = ref<{ message: string, variant: 'success' | 'error' } | null>(null)
const { start: startMessageClear, stop: stopMessageClear } = useTimeoutFn(() => {
  activationMessage.value = null
}, 4000, { immediate: false })

const methods = computed(() => mandate.value?.methods || [])
pendingMethodId.value = methods.value.find(m => m.isActive)?.id

const showActivationMessage = (message: string, variant: 'success' | 'error') => {
  stopMessageClear()
  activationMessage.value = { message, variant }
  startMessageClear()
}

const activateSelectedMethod = useDebounceFn(async (methodId: string, previousMethodId?: string) => {
  isActivationDebounced.value = false
  isActivatingMethod.value = true

  try {
    await activateMethod(methodId)
    showActivationMessage('Payment method activated.', 'success')
  }
  catch (error) {
    pendingMethodId.value = previousMethodId
    showActivationMessage(
      error instanceof Error
        ? error.message
        : 'Unable to activate payment method.',
      'error')
  }
  finally {
    isActivatingMethod.value = false
  }
}, 1000)

const selectMethod = (methodId?: string) => {
  if (!methodId
    || methodId === pendingMethodId.value
    || isActivationDebounced.value
    || isActivatingMethod.value
  ) {
    return
  }

  const previousMethodId = pendingMethodId.value
  pendingMethodId.value = methodId
  isActivationDebounced.value = true
  stopMessageClear()
  activationMessage.value = null
  void activateSelectedMethod(methodId, previousMethodId)
}
</script>

<template>
  <template v-if="status === 'active'">
    <div class="column gap-16">
      <div class="flex-1">
        <div
          :class="$style.title"
          class="flex justify-between align-end gap-8"
        >
          <h1 class="h1 mb-8 flex-1">
            Your methods
          </h1>
        </div>

        <div :class="$style.list">
          <MethodSelectable
            v-for="method in methods"
            :key="method.id"
            :method
            :loading="(isActivationDebounced || isActivatingMethod) && pendingMethodId === method.id"
            :model-value="pendingMethodId"
            @update:model-value="selectMethod"
          />
        </div>

        <BaseButton
          class="gap-8 mt-4"
          variant="secondary"
          wide
          :to="router.resolve({ name: 'mandate.select' }).href"
        >
          <BaseIcon
            :size="22"
            name="plus"
          />
          Add another method
        </BaseButton>
      </div>

      <div :class="$style.messageWrap">
        <Transition name="slide">
          <BaseAlert
            v-if="activationMessage"
            :class="$style.message"
            :variant="activationMessage.variant"
            :icon="activationMessage.variant === 'success' ? 'check' : 'important'"
          >
            {{ activationMessage.message }}
          </BaseAlert>
        </Transition>
      </div>

      <!--<CancelAllPaymentsButton />-->
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

  & > * {
    padding: 12px 0;
  }

  & > *:not(:last-child) {
    border-bottom: 1px solid var(--ypm-color-border-default);
  }
}

.messageWrap {
  position: sticky;
  bottom: 16px;
  padding-top: 8px;
}

.message {
  backdrop-filter: blur(10px);
}
</style>

<style>
.slide-enter-active, .slide-leave-active {
  transition: opacity 0.2s ease-in-out, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
}

.slide-enter-from, .slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
