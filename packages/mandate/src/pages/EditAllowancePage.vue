<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMandate } from '../useMandate'
import { PageHeader } from '@tac-crypto-payment/runtime'
import AllowanceForm from '../components/AllowanceForm.vue'

const router = useRouter()
const { allowanceAmount, isInfiniteAllowance, selectedAsset } = useMandate()

const assetSymbol = computed(() => selectedAsset.value?.symbol || 'UKWN')

const save = ({ amount, isInfinite }: { amount: string, isInfinite: boolean }) => {
  allowanceAmount.value = amount
  isInfiniteAllowance.value = isInfinite
  router.back()
}
</script>

<template>
  <div class="column flex-1 gap-16">
    <PageHeader
      title="Edit permission"
      :back-route="{ name: 'mandate.asset' }"
    />

    <AllowanceForm
      :amount="allowanceAmount"
      :is-infinite="isInfiniteAllowance"
      :asset-symbol="assetSymbol"
      :on-submit="save"
    />
  </div>
</template>
