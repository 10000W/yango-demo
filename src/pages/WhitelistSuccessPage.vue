<script setup lang="ts">
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const onCloseCallback = inject<(() => void) | null>('onClose', null)

const onClose = () => {
  if (onCloseCallback) {
    onCloseCallback()
  }
  else {
    router.push({ name: 'chain' })
  }
}
</script>

<template>
  <div :class="$style.WhitelistSuccessPage">
    <div :class="$style.content">
      <div :class="$style.icon">
        <svg
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
            fill="var(--c-success)"
          />
          <path
            d="M18 32.5L27.5 42L46 23.5"
            stroke="white"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h1 :class="$style.title">
        Thank you, stay tuned
      </h1>
      <p :class="$style.description">
        We've added you to the waiting list. You'll be the first to know when the card is available.
      </p>
    </div>

    <BaseButton
      wide
      size="large"
      variant="danger"
      @click="onClose"
    >
      Close
    </BaseButton>
  </div>
</template>

<style module lang="scss">
.WhitelistSuccessPage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  text-align: center;
  padding: 24px 0;
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
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.description {
  color: var(--c-text-soft);
  max-width: 280px;
}
</style>
