<script setup lang="ts">

import { depositAssets, depositOptions } from '@/entities/deposit'
import TokenCardSelectable from '@/components/token/TokenCardSelectable.vue'
import NetworkCardSelectable from '@/components/network/NetworkCardSelectable.vue'
import { computed, ref } from 'vue'
import { useDeposit } from '@/composables/useDeposit.ts'
import { BaseAlert, BaseButton, BaseIcon } from '@tac-crypto-payment/ui'
import { useRouter } from 'vue-router'

const router = useRouter()
const { deposit, select } = useDeposit()

const isSubmitting = ref(false)
const error = ref('')
const selectedAssetValue = ref('')
const selectedOptionValue = ref('')

// TODO: hardcoded usdt
const allowedDepositAssets = computed(() => depositAssets.filter(asset => asset.value === 'USDT'))
const allowedDepositOptions = computed(() => depositOptions.filter((option) => {
  if (!deposit.value?.options) {
    return false
  }
  return !!deposit.value.options.find(o => option.chain === o.chain && option.network === o.network)
}))
const selectedAsset = computed(() => depositAssets.find(asset => asset.value === selectedAssetValue.value))
const selectedOption = computed(() => depositOptions.find(option => option.value === selectedOptionValue.value))

selectedAssetValue.value = allowedDepositAssets.value[0]?.value || ''
const submit = async () => {
  isSubmitting.value = true
  if (!selectedAsset.value || !selectedOption.value) {
    return
  }

  try {
    await select(selectedOption.value, selectedAsset.value)

    router.replace({
      name: 'deposit-form',
      params: { depositId: deposit.value?.id },
    })
  }
  catch (e) {
    console.warn(e)
    error.value = (e as Error)?.message || 'Something went wrong. Please try again or reload this page.'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form
    class="column gap-32"
    @submit.prevent="submit"
  >
    <div>
      <p class="mb-12">
        Choose token
      </p>

      <div
        :class="$style.itemsGrid"
        class="gap-12"
      >
        <TokenCardSelectable
          v-for="asset in allowedDepositAssets"
          :key="asset.value"
          v-model="selectedAssetValue"
          :asset
        />
      </div>
    </div>
    <div>
      <p class="mb-12">
        Choose network
      </p>

      <div
        :class="$style.itemsGrid"
        class="gap-12"
      >
        <NetworkCardSelectable
          v-for="(option, idx) in (allowedDepositOptions || [])"
          :key="idx"
          v-model="selectedOptionValue"
          :option
        />
      </div>
    </div>
    <div>
      <BaseAlert
        v-if="error"
        class="mb-16"
        variant="error"
      >
        {{ error }}
      </BaseAlert>
      <BaseAlert
        v-if="selectedAsset && selectedOption"
        class="mb-16"
      >
        Send only&nbsp;{{ selectedAsset.label }}&nbsp;on&nbsp;{{ selectedOption.label }}. Funds sent as another asset or on a different network can't be recovered.
      </BaseAlert>
      <BaseButton
        type="submit"
        :disabled="!selectedAsset || !selectedOption || isSubmitting"
        :loading="isSubmitting"
        wide
      >
        <div class="flex align-center gap-8">
          Continue on payment
          <BaseIcon name="chevron-right" />
        </div>
      </BaseButton>
    </div>
  </form>
</template>

<style module lang="scss">
.itemsGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
</style>
