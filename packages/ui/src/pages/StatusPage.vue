<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, inject } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { usePayment } from '@/composables/usePayment'
import { formatNumber } from '@/utils/string-utils'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import { useAppKit } from '@/composables/useAppKit'
import type { PayZapSessionStatus } from '@/entities/payzap'

const route = useRoute()
const router = useRouter()
const { activeSession, selectedChain, amount, reset } = usePayment()

const onCloseCallback = inject<(() => void) | null>('onClose', null)

const status = computed(() => {
  if (route.query.status) {
    return route.query.status as PayZapSessionStatus
  }

  return activeSession.value?.status
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
      return `${formatNumber(amount)} ${activeSession.value?.asset}`
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
const paymentTypeIconUrl = computed(() => {
  const { walletInfo } = useAppKit()
  switch (selectedChain.value) {
    case 'evm':
      return walletInfo.value?.icon
    default:
      return '/tac.png'
  }
})
const submitLabel = computed(() => {
  switch (status.value) {
    case 'expired':
    case 'failed':
      return 'Create a new payment'
    case 'completed':
      return 'Return to the app'
    case 'confirming':
    default:
      return ''
  }
})
const isSubmitVisible = computed(() => !!submitLabel.value)

const handleSubmit = () => {
  switch (status.value) {
    case 'expired':
      router.replace('/')
      reset()
      return
    case 'failed':
      router.replace('/')
      return
    case 'completed':
      if (onCloseCallback) {
        onCloseCallback()
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
      to="/promo"
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
  //background-image: url("/card.png");
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
