<script setup lang="ts">

import QrcodeVue from 'qrcode.vue'
import DepositCryptoAmountCard from '@/components/deposit/DepositCryptoAmountCard.vue'
import DepositFiatAmountCard from '@/components/deposit/DepositFiatAmountCard.vue'
import DepositNetworkCard from '@/components/deposit/DepositNetworkCard.vue'
import DepositDetailsCard from '@/components/deposit/DepositDetailsCard.vue'
import { useDeposit } from '@/composables/useDeposit.ts'
import { computed } from 'vue'
import { BaseAlert, BaseIcon, BaseProgressTimerLine } from '@tac-crypto-payment/ui'
import { formatCryptocurrency } from '@/utils'

const now = Date.now()

const { deposit } = useDeposit()

const qrValue = computed(() => deposit.value?.address ? `${deposit.value.address}` : '')
const timerDuration = computed(() => {
  if (!deposit.value?.expiresAt) {
    return 15 * 60
  }

  const expiresAt = new Date(deposit.value.expiresAt).getTime()
  return Math.max(0, Math.floor((expiresAt - now) / 1000))
})
</script>

<template>
  <div
    v-if="deposit"
    class="column gap-32"
  >
    <div class="center">
      <h1
        :class="$style.title"
        class="mb-16"
      >
        Send {{ formatCryptocurrency(deposit.amount, deposit.asset) }}
      </h1>
      <p class="c-text-secondary">
        Scan the QR code with your wallet, or copy the address below.
      </p>
    </div>

    <div class="flex justify-center">
      <QrcodeVue
        :value="qrValue"
        :size="220"
        level="M"
        :class="$style.qr"
      />
    </div>

    <div
      :class="$style.cards"
      class="column gap-4"
    >
      <DepositCryptoAmountCard
        label="Amount"
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
        label="Address to send funds to"
        :value="deposit.address"
        copyable
      />
    </div>

    <BaseProgressTimerLine :duration="timerDuration">
      <template #default="{ timeFormatted }">
        <div class="flex align-center gap-8">
          <BaseIcon
            name="clock"
            class="c-text-secondary"
            :size="20"
          />
          <span class="c-text-secondary">Time expires in:</span>
          <span class="ml-auto h3">{{ timeFormatted }}</span>
        </div>
      </template>
    </BaseProgressTimerLine>
    <BaseAlert>
      You can close this page and come back anytime — we'll keep tracking your deposit in Payment history.
    </BaseAlert>
  </div>
</template>

<style module lang="scss">
.title {
  font-size: 46px !important;
  line-height: 56px !important;
  font-weight: 400 !important;
}

.qr {
  padding: 10px;
  background: white;
  border-radius: 12px;
}
</style>
