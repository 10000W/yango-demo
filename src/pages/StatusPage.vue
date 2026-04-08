<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, inject } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const onCloseCallback = inject<(() => void) | null>('onClose', null)

const status = computed(() => (route.query.status as string) || 'success')
const title = computed(() => (route.query.title as string) || (status.value === 'success' ? 'Payment Successful' : 'Payment Failed'))
const description = computed(() => (route.query.description as string) || (status.value === 'success' ? 'Your payment has been processed successfully.' : 'There was an error processing your payment.'))

const onClose = () => {
  if (onCloseCallback) {
    onCloseCallback()
  }
  else {
    router.replace({ name: 'chain' })
  }
}
</script>

<template>
  <div :class="$style.StatusPage">
    <div :class="$style.content">
      <div
        :class="[$style.icon, $style[status]]"
      >
        <svg
          v-if="status === 'success'"
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="32"
            cy="32"
            r="32"
            fill="currentColor"
          />
          <path
            d="M18 32.5L27.5 42L46 23.5"
            stroke="white"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="32"
            cy="32"
            r="32"
            fill="currentColor"
          />
          <path
            d="M22 22L42 42M42 22L22 42"
            stroke="white"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h1 :class="$style.title">
        {{ title }}
      </h1>
      <p :class="$style.description">
        {{ description }}
      </p>
    </div>

    <RouterLink
      to="/promo"
      style="text-decoration: none"
    >
      <div :class="$style.promo">
        Open Yango card and get cashback for your rides
        <div :class="$style.promoCard" />
      </div>
    </RouterLink>
    <BaseButton
      wide
      size="large"
      variant="danger"
      @click="onClose"
    >
      {{ status === 'success' ? 'Great!' : 'Close' }}
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
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.icon {
  margin-bottom: 24px;

  &.success {
    color: var(--c-success);
  }

  &.failed {
    color: var(--c-danger);
  }
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.description {
  color: var(--c-text-soft);
  max-width: 280px;
  text-align: center;
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
  background-image: url("/card.png");
}
</style>
