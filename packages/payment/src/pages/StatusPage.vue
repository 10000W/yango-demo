<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, inject, onMounted } from 'vue'
import { BaseButton } from '@tac-crypto-payment/ui'
import { usePayment } from '../usePayment'
import type { PaymentConfig } from '../types'
import { formatNumber } from '@tac-crypto-payment/runtime'
import { BaseIcon } from '@tac-crypto-payment/ui'
import { BaseSpinner } from '@tac-crypto-payment/ui'
import { useAppKit } from '@tac-crypto-payment/runtime'
import { PaymentState } from '@tac-crypto-payment/sdk'
import { tacImage } from '@tac-crypto-payment/runtime'

const route = useRoute()
const router = useRouter()
const { loadSession, paymentSession, selectedChain, amount, reset } = usePayment()

const config = inject<PaymentConfig | null>('tacPaymentUiConfig', null)
const onCloseCallback = config?.onClose
const sessionId = computed(() => route.params.sessionId as string | undefined)

onMounted(async () => {
  if (!sessionId.value || paymentSession.value?.session.id === sessionId.value) {
    return
  }

  try {
    await loadSession(sessionId.value)
  }
  catch (error) {
    await router.replace({
      name: 'payment.status',
      params: {
        productId: route.params.productId,
        sessionId: sessionId.value,
      },
      query: {
        status: 'failed',
        title: 'Unable to load payment',
        description: error instanceof Error ? error.message : 'Unable to load payment session.',
      },
    })
  }
})

const status = computed(() => {
  if (route.query.status) {
    return route.query.status as PaymentState
  }

  return paymentSession.value?.state
})
const title = computed(() => {
  if (route.query.title) {
    return route.query.title
  }
  switch (status.value) {
    case 'expired':
      return 'The payment time has expired'
    case 'failed':
      return 'The payment has failed'
    case 'confirming':
      return 'Payment is processing...'
    case 'completed':
      return 'Payment successful'
    default:
      return 'Processing...'
  }
})
const description = computed(() => {
  if (route.query.description) {
    return route.query.description
  }
  switch (status.value) {
    case 'expired':
      return 'If you have already submitted a transaction, do not create a new payment. The funds will be credited automatically.'
    case 'failed':
      return 'The payment has failed'
    case 'confirming':
      return 'Please wait while your transaction is being processed.'
    case 'completed':
      return `${formatNumber(paymentSession?.value?.session.amount || amount.value)} ${paymentSession.value?.asset.symbol}`
    default:
      return 'Please wait until transaction status is updated.'
  }
})
const icon = computed(() => {
  switch (status.value) {
    case 'expired':
      return 'expired'
    case 'failed':
      return 'important'
    case 'completed':
      return `success`
    case 'confirming':
    default:
      return 'loading'
  }
})
const submitLabel = computed(() => {
  switch (status.value) {
    case 'expired':
    case 'failed':
      return 'Create a new payment'
    case 'completed':
      return onCloseCallback ? 'Return to the app' : 'Go back'
    case 'confirming':
    default:
      return ''
  }
})
const isSubmitVisible = computed(() => !!submitLabel.value)
const paymentTypeIconUrl = computed(() => {
  const { walletInfo } = useAppKit()
  if (selectedChain?.value === 'evm') {
    return walletInfo.value?.icon
  }
  return tacImage
})

const handleSubmit = () => {
  switch (status.value) {
    case 'cancelled':
    case 'expired':
    case 'failed':
      router.replace({ name: 'payment.start' })
      reset()
      return
    case 'completed':
      if (onCloseCallback) {
        onCloseCallback()
      }
      else {
        reset()
        router.replace({
          name: 'payment.start',
          params: { productId: route.params.productId },
        })
      }
      return
    case 'confirming':
    default:
      return
  }
}
</script>

<template>
  <div
    :class="[$style.StatusPage, $style[`_${status}`]]"
    class="column gap-16"
  >
    <div :class="$style.content">
      <BaseSpinner v-if="icon === 'loading'">
        <div
          :class="$style.loadingIcon"
          :style="{backgroundImage: `url(${paymentTypeIconUrl})`}"
        />
      </BaseSpinner>
      <BaseIcon
        v-else
        :class="$style.icon"
        :name="icon"
        :size="60"
      />
      <h1 class="h1 center mb-8">
        {{ title }}
      </h1>
      <p
        class="h4 center c-text-secondary"
        :class="$style.description"
      >
        {{ description }}
      </p>
    </div>

    <!--    <RouterLink
      :to="{ name: 'payment.promo' }"
      style="text-decoration: none"
    >
      <div :class="$style.promo">
        Open Yango card and get cashback for your rides
        <div :class="$style.promoCard" />
      </div>
    </RouterLink>-->
    <BaseButton
      v-if="isSubmitVisible"
      wide
      class="gap-8"
      @click="handleSubmit"
    >
      <BaseIcon
        name="reload"
        size="22"
      />
      {{ submitLabel }}
    </BaseButton>
  </div>
</template>

<style module lang="scss">
.StatusPage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  text-align: center;

  &._expired {
    .icon {
       color: var(--ypm-color-state-warning);
    }
  }

  &._completed {
    .icon {
      color: var(--ypm-color-state-success);
    }
  }

  &._failed {
    .icon {
      color: var(--ypm-color-state-error);
    }
  }
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.promo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--c-text);
  text-decoration: none;
  text-align: left;
  padding: 16px;
  background-color: oklch(from var(--c-primary) l c h / 20%);
  border-radius: 16px;
  margin-bottom: 16px;
}

.promoCard {
  width: 80px;
  height: 40px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.loadingIcon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
