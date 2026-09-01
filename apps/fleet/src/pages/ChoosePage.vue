<script setup lang="ts">
import { useDeposit } from '../composables/useDeposit'
import DepositChooseForm from '../components/deposit/DepositChooseForm.vue'
import { formatCryptocurrency, formatCurrency } from '../utils'
import StackableCard from '../components/StackableCard.vue'

const { deposit } = useDeposit()
</script>

<template>
  <div>
    <div
      :class="$style.grid"
      class="gap-32"
    >
      <div class="column gap-8">
        <StackableCard
          v-if="deposit"
          class="column gap-10"
        >
          <p class="c-text-secondary">
            Deposit amount
          </p>

          <p :class="$style.title">
            {{ formatCryptocurrency(deposit.requestedAmount || 0, deposit?.asset) }}
          </p>
        </StackableCard>
        <StackableCard
          v-if="deposit?.credit"
          class="column gap-10"
        >
          <p class="c-text-secondary">
            You’ll receive
          </p>
          <p :class="$style.title">
            ≈&nbsp;{{ formatCurrency(deposit.credit.amount, deposit?.credit.currency) }}
          </p>
          <p
            v-if="deposit?.credit"
            class="c-text-secondary"
          >
            1 {{ deposit.asset }} ≈ {{ formatCurrency(deposit.credit.rate, deposit.credit.currency) }} · refreshes every 15 min
          </p>
        </StackableCard>
      </div>
      <div class="column gap-32">
        <div class="column gap-32">
          <div>
            <h1
              :class="$style.title"
              class="mb-16"
            >
              Deposit crypto, get {{ deposit?.credit?.currency }}.
            </h1>

            <p class="c-text-secondary">
              Send a stablecoin from any wallet. We convert it to {{ deposit?.credit?.currency }} and credit your Fleet balance.
            </p>
          </div>

          <DepositChooseForm />
        </div>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(440px, 1fr));

  @media (max-width: 640px) {
    display: flex;
    flex-direction: column;
  }
}

.itemsGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.title {
  font-size: 46px !important;
  line-height: 56px !important;
  font-weight: 400 !important;
}
</style>
