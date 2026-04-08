<script setup lang="ts">
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const onCloseCallback = inject<(() => void) | null>('onClose', null)

const features = [
  {
    text: 'Top up your card with stablecoins',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9V15M9 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    text: 'Cashback on Yango services & everyday spending',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="17.5" r="2.5" stroke="currentColor" stroke-width="2"/></svg>`,
  },
  {
    text: 'Earn 4–5% yield on your balance',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21H3V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 14L12 9L16 13L21 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12V8H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
]

const onApply = () => {
  router.push({ name: 'whitelist-success' })
}

const onDismiss = () => {
  if (onCloseCallback) {
    onCloseCallback()
  }
  else {
    router.push({ name: 'status' })
  }
}
</script>

<template>
  <div :class="$style.PromoPage">
    <div :class="$style.cardContainer">
      <div :class="$style.card">
        <img
          src="/card.png"
          alt="Yango Card"
          :class="$style.cardImg"
        >
      </div>
    </div>

    <div :class="$style.content">
      <h1 :class="$style.title">
        Yango card
      </h1>
      <h2 :class="$style.subtitle">
        Virtual card for everyday spendings
      </h2>
      <ul :class="$style.features">
        <li
          v-for="feature in features"
          :key="feature.text"
          :class="$style.featureItem"
        >
          <div
            :class="$style.icon"
            v-html="feature.icon"
          />
          {{ feature.text }}
        </li>
      </ul>
    </div>

    <div :class="$style.actions">
      <BaseButton
        wide
        size="large"
        variant="transparent"
        @click="onDismiss"
      >
        Maybe later
      </BaseButton>
      <BaseButton
        wide
        size="large"
        variant="danger"
        @click="onApply"
      >
        Apply to waiting list
      </BaseButton>
    </div>
  </div>
</template>

<style module lang="scss">
.PromoPage {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 24px;
}

.cardContainer {
  perspective: 1000px;
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  padding: 20px;
}

.card {
  width: 280px;
  aspect-ratio: 1.586;
  position: relative;
  transform-style: preserve-3d;
  animation: float 6s ease-in-out infinite, rotate 12s linear infinite;
  filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.2));
}

.cardImg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 16px;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes rotate {
  0% {
    transform: rotateY(-10deg) rotateX(5deg);
  }
  50% {
    transform: rotateY(10deg) rotateX(-5deg);
  }
  100% {
    transform: rotateY(-10deg) rotateX(5deg);
  }
}

.card {
  animation: combined 8s ease-in-out infinite;
}

@keyframes combined {
  0%, 100% {
    transform: translateY(0) rotateY(-15deg) rotateX(5deg);
  }
  50% {
    transform: translateY(-15px) rotateY(15deg) rotateX(-5deg);
  }
}

.content {
  flex: 1;
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.featureItem {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 16px;
  color: var(--c-text-soft);
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background-color: oklch(from var(--c-primary) l c h / 10%);
  color: var(--c-primary);
  flex-shrink: 0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;
}
</style>
