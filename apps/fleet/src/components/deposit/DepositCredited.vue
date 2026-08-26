<script setup lang="ts">

import DepositCryptoAmountCard from '@/components/deposit/DepositCryptoAmountCard.vue'
import DepositFiatAmountCard from '@/components/deposit/DepositFiatAmountCard.vue'
import DepositNetworkCard from '@/components/deposit/DepositNetworkCard.vue'
import DepositDetailsCard from '@/components/deposit/DepositDetailsCard.vue'
import { useDeposit } from '@/composables/useDeposit.ts'
import { BaseButton, BaseIcon } from '@tac-crypto-payment/ui'
import { formatCurrency } from '@/utils'
import { depositOptions } from '@/entities/deposit'
import { computed } from 'vue'

const { deposit } = useDeposit()

const explorerLink = computed(() => {
  if (!deposit.value || !deposit.value.txHash) {
    return '#'
  }
  const option = depositOptions.find(o => o.chain === deposit.value?.chain && o.network === deposit.value?.network)
  return option ? option.getExplorerLink(deposit.value.txHash) : '#'
})
</script>

<template>
  <div
    v-if="deposit"
    class="column gap-32"
  >
    <div class="column gap-16 center">
      <BaseIcon
        class="c-text-success mx-auto"
        :size="66"
        name="success"
      />
      <h1 :class="$style.title">
        + {{ formatCurrency(deposit.credit.amount, deposit.credit.currency) }}
      </h1>
      <p class="c-text-secondary">
        Credited to your Fleet balance
      </p>
    </div>

    <div
      :class="$style.cards"
      class="column gap-16"
    >
      <div class="column gap-4">
        <DepositCryptoAmountCard
          label="Amount received:"
          :amount="deposit.amount"
          :asset="deposit.asset"
        />
        <DepositFiatAmountCard
          label="Credited to balance:"
          :amount="deposit.credit?.amount"
          :currency="deposit.credit?.currency"
        />
        <DepositNetworkCard
          :chain="deposit.chain"
          :network="deposit.network"
        />
        <DepositDetailsCard
          label="Transaction hash:"
          :value="deposit.txHash"
          copyable
        />
      </div>
      <a
        :href="explorerLink"
        target="_blank"
        :class="$style.link"
        class="mx-auto flex gap-8 align-center c-text-secondary baseline"
      >
        View on explorer
        <BaseIcon
          name="link"
          :size="20"
        />
      </a>
    </div>

    <div class="column gap-8">
      <BaseButton
        wide
        :href="deposit?.returnUrl || undefined"
        :disabled="!deposit?.returnUrl"
      >
        Return to Fleet
      </BaseButton>
      <BaseButton
        wide
        disabled
      >
        View payment history
      </BaseButton>
    </div>
  </div>
</template>

<style module lang="scss">
.title {
  font-size: 46px !important;
  line-height: 56px !important;
  font-weight: 400 !important;
}

.link {
  text-decoration: none;
}
</style>
