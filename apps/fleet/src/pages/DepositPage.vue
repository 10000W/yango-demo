<script setup lang="ts">
import ProgressSteps from '../components/common/ProgressSteps.vue'
import { useDeposit } from '../composables/useDeposit'
import DepositSend from '../components/deposit/DepositSend.vue'
import DepositProcessing from '../components/deposit/DepositProcessing.vue'
import DepositCredited from '../components/deposit/DepositCredited.vue'
import DepositExpired from '../components/deposit/DepositExpired.vue'

const steps = [
  {
    label: 'Waiting',
    value: 1,
  },
  {
    label: 'Confirming',
    value: 2,
  },
  {
    label: 'Credited',
    value: 3,
  },
]

const { deposit } = useDeposit()
</script>

<template>
  <div
    :class="$style.DepositPage"
    class="column align-center flex-1"
  >
    <div
      :class="$style.content"
      class="column gap-32 flex-1"
    >
      <ProgressSteps
        :steps
        :failed="deposit?.status === 'expired'"
        :model-value="deposit?.status === 'completed'
          ? 3 : deposit?.status === 'confirming' || deposit?.status === 'expired'
            ? 2 : 1"
      />

      <div class="flex-1 column justify-center">
        <DepositCredited v-if="deposit?.status === 'completed'" />
        <DepositProcessing v-else-if="deposit?.status === 'confirming'" />
        <DepositExpired v-else-if="deposit?.status === 'expired'" />
        <DepositSend v-else />
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.DepositPage {
  //
}

.content {
  width: 100%;
  max-width: 500px;
}

.title {
  font-size: 46px !important;
  line-height: 56px !important;
  font-weight: 400 !important;
}

.cards {
  width: 100%;
}

.options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.address {
  overflow-wrap: anywhere;
}
</style>
