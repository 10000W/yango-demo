<script setup lang="ts">

import QrcodeVue from 'qrcode.vue'
import DepositCryptoAmountCard from './DepositCryptoAmountCard.vue'
import DepositFiatAmountCard from './DepositFiatAmountCard.vue'
import DepositNetworkCard from './DepositNetworkCard.vue'
import DepositDetailsCard from './DepositDetailsCard.vue'
import { useDeposit } from '../../composables/useDeposit'
import { computed } from 'vue'
import { BaseAlert, BaseIcon, BaseProgressTimerLine } from '@tac-crypto-payment/ui'
import { evmAssets, solanaAssets, tonAssets } from '@tac-crypto-payment/sdk'
import { formatCryptocurrency } from '../../utils'
import { parseUnits } from 'viem'

const now = Date.now()

const { deposit } = useDeposit()

const evmChainIds: Record<string, number> = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  arbitrum: 42161,
  base: 8453,
}

const qrValue = computed(() => {
  const currentDeposit = deposit.value
  if (!currentDeposit?.address) {
    return ''
  }
  try {
    const chainId = currentDeposit.network ? evmChainIds[currentDeposit.network] : undefined
    const token = chainId === undefined
      ? undefined
      : evmAssets.find(asset => asset.chain.id === chainId && asset.symbol === currentDeposit.asset)
    const atomicAmount = token ? parseUnits(currentDeposit.amount, token.decimals) : undefined

    if (token && atomicAmount) {
      return `ethereum:${token.address}@${chainId}/transfer?address=${currentDeposit.address}&uint256=${atomicAmount}`
    }

    const solanaToken = solanaAssets.find(asset => asset.symbol === currentDeposit.asset)
    if (currentDeposit.chain === 'solana' && solanaToken) {
      return `solana:${currentDeposit.address}?amount=${currentDeposit.amount}&spl-token=${solanaToken.address}`
    }

    const tonJetton = tonAssets.find(asset => asset.symbol === currentDeposit.asset)
    const tonAmount = tonJetton ? parseUnits(currentDeposit.amount, tonJetton.decimals) : undefined
    if (currentDeposit.chain === 'ton' && tonJetton && tonAmount) {
      return `ton://transfer/${currentDeposit.address}?amount=${tonAmount}&jetton=${tonJetton.address}`
    }

    // fallback and tron
    return currentDeposit.address
  }
  catch (e) {
    console.warn(e)
    return currentDeposit.address
  }
})
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

    <div
      v-if="qrValue"
      class="flex justify-center"
    >
      <QrcodeVue
        :value="qrValue"
        :size="220"
        :class="$style.qr"
      />
    </div>

    <BaseAlert
      v-else
      variant="error"
    >
      We couldn't load the QR code. Try to reload the page.
      <br>
      If problem persists, send funds directly to the address specified below.
    </BaseAlert>

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
      You can close this page and come back anytime — we'll keep tracking your deposit status here.
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
