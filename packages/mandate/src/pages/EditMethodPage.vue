<script setup lang="ts">
import { PageHeader } from '@tac-crypto-payment/runtime'
import MethodInfo from '../components/MethodInfo.vue'
import MethodIcon from '../components/MethodIcon.vue'
import { BaseBottomSheet, BaseButton, BaseIcon } from '@tac-crypto-payment/ui'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMandate } from '../useMandate'
import { getMethodName } from '../entities/method'
import { isInfiniteAllowanceCap } from '../entities/allowance'
import AllowanceForm from '../components/AllowanceForm.vue'
import { evmAssets, getNetworkName, tronAssets } from '@tac-crypto-payment/sdk'
import type { PaymentOption } from '@tac-crypto-payment/runtime'

const route = useRoute()
const router = useRouter()
const {
  mandate,
  revokeMethod,
  updateMandate,
  selectedAsset,
  selectedPaymentOption,
  allowanceAmount,
  isInfiniteAllowance,
  approve,
} = useMandate()
const isDisconnectConfirmOpen = ref(false)
const isRevoking = ref(false)
const revokeError = ref('')

const method = mandate.value?.methods.find(item => item.id === route.params.methodId)
if (!method) {
  void router.replace({
    name: 'mandate.start',
    params: { mandateId: route.params.mandateId },
  })
}

const name = computed(() => method ? getMethodName(method) : '')
const methodAsset = computed(() => {
  if (!method || method.kind === 'binance_pay') {
    return undefined
  }

  return [...evmAssets, ...tronAssets].find(asset =>
    asset.symbol === method.tokenSymbol && getNetworkName(asset.chain.id) === method.network,
  )
})
const methodAllowance = computed(() => {
  if (!method) {
    return ''
  }
  return String(Number(method.capUnits) / 10 ** method.tokenDecimals)
})
const hasInfiniteAllowance = computed(() =>
  method ? isInfiniteAllowanceCap(method.capUnits, method.tokenDecimals) : false,
)

const saveAllowance = async ({ amount, isInfinite }: { amount: string, isInfinite: boolean }) => {
  if (!methodAsset.value) {
    throw new Error('The asset for this payment method is unavailable.')
  }

  const paymentOption: PaymentOption = {
    name: `${methodAsset.value.chain.name} Wallet`,
    icon: '',
    type: 'blockchain',
    namespaces: [methodAsset.value.namespace],
  }

  selectedAsset.value = methodAsset.value
  selectedPaymentOption.value = paymentOption
  allowanceAmount.value = amount
  isInfiniteAllowance.value = isInfinite

  await approve()
  await updateMandate()
  await router.replace({
    name: 'mandate.start',
    params: { mandateId: route.params.mandateId },
  })
}

const handleRevoke = async () => {
  try {
    isRevoking.value = true
    revokeError.value = ''
    if (!method?.id) {
      return
    }

    await revokeMethod(method.id)
  }
  catch (error) {
    revokeError.value = error instanceof Error
      ? error.message
      : 'Unable to cancel automatic payments.'
  }
  finally {
    isRevoking.value = false
    revokeError.value = ''
    isDisconnectConfirmOpen.value = false
    await updateMandate()
    void router.replace({
      name: 'mandate.start',
      params: { mandateId: route.params.mandateId },
    })
  }
}
</script>

<template>
  <div class="column gap-16">
    <PageHeader
      title="Edit method"
      :back-route="{ name: 'mandate.start', params: route.params }"
    />

    <template v-if="method">
      <MethodInfo :method="method" />

      <p
        v-if="method.kind === 'binance_pay'"
        class="c-text-secondary"
      />

      <AllowanceForm
        v-if="method.kind !== 'binance_pay'"
        :amount="hasInfiniteAllowance ? '200' : methodAllowance"
        :is-infinite="hasInfiniteAllowance"
        :asset-symbol="method.tokenSymbol"
        submit-label="Update permission"
        :on-submit="saveAllowance"
      />

      <BaseButton
        class="gap-8"
        variant="secondary"
        @click="isDisconnectConfirmOpen = true"
      >
        <BaseIcon
          :size="22"
          name="disconnect"
        />
        Revoke access
      </BaseButton>

      <BaseBottomSheet
        v-model="isDisconnectConfirmOpen"
        to=".tac-crypto-payment"
      >
        <div class="column align-center p-24">
          <MethodIcon
            class="mb-16"
            :method="method"
            :size="66"
          />

          <div class="h2 mb-8 center">
            Revoke {{ name }}?
          </div>

          <div class="c-text-secondary mb-24 center">
            You won't be able to pay for rides with it until you link it again.
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
              :disabled="isRevoking"
              class="flex-1"
              @click="isDisconnectConfirmOpen = false"
            >
              Keep it
            </BaseButton>
            <BaseButton
              :disabled="isRevoking"
              :loading="isRevoking"
              class="flex-1"
              variant="secondary"
              @click="handleRevoke"
            >
              Revoke access
            </BaseButton>
          </div>
        </div>
      </BaseBottomSheet>
    </template>
  </div>
</template>

<style module lang="scss">
.confirmBtns {
  width: 100%;
}
</style>
