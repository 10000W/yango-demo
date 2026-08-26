<script setup lang="ts">

import DepositCryptoAmountCard from '@/components/deposit/DepositCryptoAmountCard.vue'
import DepositFiatAmountCard from '@/components/deposit/DepositFiatAmountCard.vue'
import DepositNetworkCard from '@/components/deposit/DepositNetworkCard.vue'
import DepositDetailsCard from '@/components/deposit/DepositDetailsCard.vue'
import { useDeposit } from '@/composables/useDeposit.ts'
import { BaseIcon, BaseSpinner } from '@tac-crypto-payment/ui'
import { depositOptions } from '@/entities/deposit'
import { computed } from 'vue'

const { deposit } = useDeposit()

const explorerLink = computed(() => {
  if (!deposit.value || !deposit.value.txHash) return '#'
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
      <BaseSpinner
        name="loading"
        class="mx-auto"
      />
      <h1 :class="$style.title">
        Processing
      </h1>
      <p class="c-text-secondary">
        We've received your transaction. It's being confirmed on {{ deposit.network || deposit.chain }}. This usually takes a
        few minutes. You can close this page.
      </p>
    </div>

    <div
      :class="$style.cards"
      class="column gap-16"
    >
      <div class="column gap-4">
        <DepositCryptoAmountCard
          label="Amount sent:"
          :amount="deposit.amount"
          :asset="deposit.asset"
        />
        <DepositFiatAmountCard
          v-if="deposit.credit"
          :amount="deposit.credit.amount"
          :currency="deposit.credit.currency"
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
