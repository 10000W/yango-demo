<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const status = computed(() => (route.query.status as string) || 'success')
const title = computed(() => (route.query.title as string) || (status.value === 'success' ? 'Payment Successful' : 'Payment Failed'))
const description = computed(() => (route.query.description as string) || (status.value === 'success' ? 'Your payment has been processed successfully.' : 'There was an error processing your payment.'))

const onClose = () => {
  router.push({ name: 'chain' })
}
</script>

<template>
  <div :class="$style.page">
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
    <div :class="$style.footer">
      <BaseButton
        :class="$style.button"
        @click="onClose"
      >
        Close
      </BaseButton>
    </div>
  </div>
</template>

<style module lang="scss">
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: calc(100vh - 24px);
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
    color: var(--c-yango-green);
  }

  &.failed {
    color: var(--c-yango-red);
  }
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.description {
  color: #666;
  max-width: 280px;
}

.footer {
  width: 100%;
  padding-bottom: 12px;
}

.button {
  width: 100%;
}
</style>
