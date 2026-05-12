<script setup lang="ts">
import { usePayment } from '@/composables/usePayment'
import { formatNumber } from '@/utils/string-utils'
import BaseChip from '@/components/base/BaseChip.vue'
import { ref } from 'vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseStack from '@/components/base/BaseStack.vue'
import BaseStackItem from '@/components/base/BaseStackItem.vue'
import BaseProgressTimer from '@/components/base/BaseProgressTimer.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { BaseError } from 'viem'
import BaseIcon from '@/components/base/BaseIcon.vue'

const { pay, amount, selectedAsset, activeSession, txStatusMessage } = usePayment()

const emit = defineEmits<{
  error: [message: string]
}>()

const gasless = ref(false)
const isPaying = ref(false)
const isExpired = ref(false)
const errorMessage = ref('')

const onTimerComplete = () => {
  isExpired.value = true
  emit('error', 'Payment session has expired. Please try again.')
}

const handleError = (e: unknown, defaultMessage: string) => {
  if (e instanceof BaseError) {
    console.log(JSON.parse(JSON.stringify(e, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    )))
    errorMessage.value = e.shortMessage || e.message
  }
  else {
    errorMessage.value = e instanceof Error ? e.message : defaultMessage
  }
}
const submit = async () => {
  try {
    isPaying.value = true
    errorMessage.value = ''
    await pay()
    // router.replace({ name: 'status', query: { status: 'success' } })
  }
  catch (error) {
    console.warn(error)
    isPaying.value = false
    handleError(error, 'Transaction failed')
  }
}

</script>

<template>
  <form
    class="column gap-16"
    @submit.prevent="submit"
  >
    <div class="column flex-1 gap-16">
      <div
        v-if="selectedAsset"
        class="column gap-8"
      >
        <p class="h6">
          Amount to pay:
        </p>

        <p class="h3">
          {{ formatNumber(amount) }} {{ selectedAsset.symbol }} <span class="c-text-secondary"> ≈ 689 Bs.</span>
        </p>

        <BaseChip v-if="gasless">
          0% Network fee
        </BaseChip>
      </div>
      <hr>
      <div
        v-if="activeSession"
        class="column gap-8"
      >
        <p class="h6">
          Address to sent funds to:
        </p>

        <code
          :class="$style.wallet"
          class="h3"
        >
          {{ activeSession.merchantWallet }}
        </code>
      </div>
    </div>

    <BaseAlert
      v-if="selectedAsset && 'chain' in selectedAsset"
    >
      Only send {{ selectedAsset.symbol }} using the {{ selectedAsset.chain.name }} network
    </BaseAlert>

    <BaseStack>
      <BaseStackItem
        v-if="txStatusMessage"
        key="status"
        label="Status:"
      >
        <div>
          <BaseIcon
            name="loading"
            style="vertical-align: bottom;"
          />
          {{ txStatusMessage }}
        </div>
      </BaseStackItem>
      <BaseStackItem
        key="expires"
        label="Expires in:"
      >
        <BaseProgressTimer
          :duration="15 * 60"
          :size="16"
          color="var(--ypm-color-brand-primary)"
          @complete="onTimerComplete"
        >
          <template #default="{ timeFormatted }">
            <span>{{ timeFormatted }}</span>
          </template>
        </BaseProgressTimer>
      </BaseStackItem>
      <BaseStackItem
        v-if="selectedAsset"
        key="rate"
        label="Rate:"
      >
        {{ formatNumber(1, 2) }} {{ selectedAsset.symbol }} = 482.44 Bs.
      </BaseStackItem>
      <BaseStackItem
        v-if="errorMessage"
        key="error"
        label=""
      >
        <div
          class="left flex gap-8 c-text-error"
          style="white-space: pre-line;"
        >
          <BaseIcon name="important" />
          {{ errorMessage }}
        </div>
      </BaseStackItem>
    </BaseStack>

    <BaseButton
      v-if="selectedAsset"
      type="submit"
      wide
      :loading="isPaying"
      class="gap-8"
      :disabled="isExpired || isPaying"
    >
      Pay now
      <span style="color: #F2EBFF26">·</span>
      {{ formatNumber(amount) }} {{ selectedAsset.symbol }}
    </BaseButton>
  </form>
</template>

<style module lang="scss">
.wallet {
  overflow: hidden;
  word-wrap: break-word;
  display: block;
}
</style>
