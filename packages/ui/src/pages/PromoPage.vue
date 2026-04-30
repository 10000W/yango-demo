<script setup lang="ts">
import { inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useImage } from '@vueuse/core'
import BaseButton from '@ui/components/base/BaseButton.vue'
import BaseIcon from '@ui/components/base/BaseIcon.vue'

const router = useRouter()
const onCloseCallback = inject<(() => void) | null>('onClose', null)

const { isReady: isCardReady } = useImage({ src: '/card.png' })
const { isReady: isPercentReady } = useImage({ src: '/percent.png' })

const isImagesLoaded = computed(() => isCardReady.value && isPercentReady.value)

const features = [
  {
    label: 'Top up by crypto',
    desc: 'Top up your card with stablecoins',
    icon: `coins`,
  },
  {
    label: '3.5% Cashback',
    desc: 'Cashback on Yango services & everyday spending',
    icon: `cashback`,
  },
  {
    label: 'Staking 4-5%',
    desc: 'Earn from the balance that is in your account',
    icon: `stake`,
  },
]

const onApply = () => {
  router.replace({ name: 'whitelist' })
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
    <div
      :class="[$style.cardContainer, {[$style['_ready']]: isImagesLoaded}]"
      class="flex align-center justify-center"
    >
      <div :class="$style.card" />
      <div :class="$style.percents">
        <div :class="[$style.percent, $style._left]" />
        <div :class="[$style.percent, $style._right]" />
      </div>
    </div>

    <div
      :class="$style.content"
      class="pt-16 mb-8"
    >
      <h1 class="h1 mb-8 center">
        Yango card
      </h1>
      <p class="c-text-secondary p3 center mb-8">
        Virtual card for everyday spendings!
      </p>
      <ul :class="$style.features">
        <li
          v-for="(feature, idx) in features"
          :key="idx"
          class="flex gap-8"
          :class="$style.feature"
        >
          <BaseIcon
            size="38"
            style="flex-shrink: 0"
            class="c-text-primary"
            :name="feature.icon"
          />
          <div class="column gap-4">
            <p class="h5">
              {{ feature.label }}
            </p>
            <p class="c-text-secondary">
              {{ feature.desc }}
            </p>
          </div>
        </li>
      </ul>
    </div>

    <div class="column gap-8">
      <BaseButton
        wide
        @click="onApply"
      >
        Apply to waiting list
      </BaseButton>
      <BaseButton
        wide
        variant="secondary"
        @click="onDismiss"
      >
        Maybe later
      </BaseButton>
    </div>
  </div>
</template>

<style module lang="scss">
.PromoPage {
  display: flex;
  flex-direction: column;
  height: 100%;

  --ypm-color-brand-primary: #FF1A1A;
  --ypm-color-btn-main-bg: #FF1A1A;
}

.cardContainer {
  position: relative;
  height: 230px;
  perspective: 1000px;
  min-height: 230px;

  &._ready {
    .card {
      opacity: 1;
      animation: cardEntrance 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards, card 8s ease-in-out 1.8s infinite;
    }

    .percents {
      & > *:first-child {
        animation: percentsEntrance 0.6s ease 1.2s forwards, percents 8s ease-in-out 1.8s infinite;
      }

      & > *:last-child {
        animation: percentsEntrance 0.7s ease 1.4s forwards, percents 8s ease-in-out 2.2s infinite;
      }
    }
  }
}

.card, .percents {
  width: 280px;
  aspect-ratio: 1.586;
  z-index: 1;
}

.card {
  position: relative;
  transform-style: preserve-3d;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  will-change: transform, opacity;
  background-image: url("/card.png");
  overflow: hidden;
  opacity: 0;
}

.percents {
  position: absolute;
  will-change: transform, opacity;

  & > * {
    position: absolute;
    opacity: 0;
    transform-style: preserve-3d;
    background-image: url("/percent.png");
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    will-change: transform, opacity;
  }

  & > *:first-child {
    top: -8px;
    left: -8px;
    width: 50px;
    height: 50px;
    rotate: 15deg;
  }

  & > *:last-child {
    right: -15px;
    bottom: -20px;
    width: 88px;
    height: 88px;
    rotate: -15deg;
  }
}

.content {
  flex: 1;
}

.features {
  list-style: none;
  padding: 0;

  & > *:not(:last-child) {
    border-bottom: 1px solid var(--ypm-color-border-default);
  }
}

.feature {
  padding: 16px 0;
}

@keyframes cardEntrance {
  0% {
    transform: translateY(100px) rotateY(-180deg) rotateX(14deg) rotateZ(354deg) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateY(0) rotateY(1deg) rotateX(14deg) rotateZ(354deg) scale(1);
    opacity: 1;
  }
}

@keyframes percentsEntrance {
  from {
    opacity: 0;
    transform: translateY(10px) rotateY(-7deg) rotateX(5deg) scale(0.75);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateY(-7deg) rotateX(5deg) scale(1);
  }
}

@keyframes card {
  0%, 100% {
    transform: translateY(0) rotateY(1deg) rotateX(14deg) rotateZ(354deg) scale(1);
    filter: contrast(1) saturate(1);
  }
  50% {
    transform: translateY(-2px) rotateY(1deg) rotateX(14deg) rotateZ(356deg) scale(1.01);
    filter: contrast(1.05) saturate(1.025);
  }
}
@keyframes percents {
  0%, 100% {
    transform: translateY(0) rotateY(-7deg) rotateX(5deg) scale(1);
  }
  50% {
    transform: translateY(-4px) rotateY(-2deg) rotateX(2deg) scale(1.05);
  }
}

@keyframes backgroundEntrance {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
