<script setup lang="ts">
import { usePayment } from '@/composables/usePayment.ts'
import { onMounted, ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseProgressTimer from '@/components/base/BaseProgressTimer.vue'
import { useRouter } from 'vue-router'
import { useAppKit } from '@/composables/useAppKit.ts'
import { formatUnits, BaseError } from 'viem'
import { compactNumber } from '@/utils/string-utils.ts'

const { createSession, pay, amount, selectedAsset, estimateGasFee } = usePayment()
const { walletInfo, shortAddress } = useAppKit()
const router = useRouter()

const estimatedGas = ref(0n)
const isPaying = ref(false)
const errorMessage = ref('')
const isExpired = ref(false)

const onTimerComplete = () => {
  isExpired.value = true
  errorMessage.value = 'Payment session has expired. Please try again.'
}

const handleError = (e: unknown, defaultMessage: string) => {
  if (e instanceof BaseError) {
    errorMessage.value = e.shortMessage || e.message
  }
  else {
    errorMessage.value = e instanceof Error ? e.message : defaultMessage
  }
}

onMounted(async () => {
  try {
    isPaying.value = true
    await createSession()
    estimatedGas.value = (await estimateGasFee()) || 0n
  }
  catch (e) {
    handleError(e, 'Failed to initialize payment')
    router.replace({
      name: 'status',
      query: {
        status: 'failed',
        description: errorMessage.value,
      },
    })
  }
  finally {
    isPaying.value = false
  }
})

const submit = async () => {
  try {
    isPaying.value = true
    errorMessage.value = ''
    await pay()
    router.replace({ name: 'status', query: { status: 'success' } })
  }
  catch (error) {
    console.warn(error)
    handleError(error, 'Transaction failed')
  }
  finally {
    isPaying.value = false
  }
}
</script>

<template>
  <div :class="$style.PayPage">
    <h1 :class="$style.title">
      Sign transaction
    </h1>

    <div :class="$style.content">
      <BaseAlert
        v-if="errorMessage"
        variant="error"
        :class="$style.alert"
      >
        {{ errorMessage }}
      </BaseAlert>

      <div :class="$style.infoBox">
        <div :class="$style.infoRow">
          <span :class="$style.label">Wallet</span>
          <div :class="$style.value">
            <img
              v-if="walletInfo?.icon"
              :src="walletInfo.icon"
              :class="$style.icon"
              alt="wallet icon"
            >
            <span>{{ shortAddress }}</span>
          </div>
        </div>

        <div :class="$style.infoRow">
          <span :class="$style.label">Amount</span>
          <div :class="$style.value">
            <img
              v-if="selectedAsset?.icon"
              :src="selectedAsset.icon"
              :class="$style.icon"
              alt="asset icon"
            >
            <span>{{ amount }} {{ selectedAsset?.symbol }}</span>
          </div>
        </div>

        <div :class="$style.infoRow">
          <span :class="$style.label">Gas fee</span>
          <div :class="$style.value">
            <img
              src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png"
              :class="$style.icon"
              alt="gas icon"
            >
            <span>{{ compactNumber(Math.max(+formatUnits(estimatedGas, 18), 0.0001), 4) || '...' }} ETH</span>
          </div>
        </div>

        <div :class="$style.infoRow">
          <span :class="$style.label">Expires in</span>
          <div :class="$style.value">
            <BaseProgressTimer
              :duration="15 * 60"
              :size="24"
              color="var(--c-yango-red)"
              @complete="onTimerComplete"
            >
              <template #default="{ timeFormatted }">
                <span>{{ timeFormatted }}</span>
              </template>
            </BaseProgressTimer>
          </div>
        </div>
      </div>
    </div>

    <div :class="$style.btns">
      <BaseButton
        :class="$style.btn"
        variant="secondary"
        wide
        size="large"
        :disabled="isPaying"
        @click="router.replace('/chain')"
      >
        Select another wallet
      </BaseButton>

      <BaseButton
        :class="$style.btn"
        variant="danger"
        wide
        size="large"
        :loading="isPaying"
        :disabled="isExpired || isPaying"
        @click="submit"
      >
        {{ isExpired ? 'Expired' : `Pay ${amount} ${selectedAsset?.symbol}` }}
      </BaseButton>
    </div>
  </div>
</template>

<style module lang="scss">
.PayPage {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 32px;
}

.content {
  flex: 1;
}

.alert {
  margin-bottom: 24px;
}

.infoBox {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 1px solid var(--c-border);
  border-bottom: 1px solid var(--c-border);
}

.infoRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 16px;
  color: var(--c-text-soft);
}

.value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.icon {
  width: 24px;
  height: 24px;
}

.btn {
  margin-top: auto;
}

.btns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
