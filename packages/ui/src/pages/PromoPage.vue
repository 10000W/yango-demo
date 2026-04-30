<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useImage } from '@vueuse/core'
import BaseButton from '@ui/components/base/BaseButton.vue'
import BaseIcon from '@ui/components/base/BaseIcon.vue'
import cardImage from '@ui/assets/images/card.png'
import cardPercent from '@ui/assets/images/percent.png'

const router = useRouter()

const { isReady: isCardReady } = useImage({ src: cardImage })
const { isReady: isPercentReady } = useImage({ src: cardPercent })

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
  router.replace('/')
}
</script>

<template>
  <div :class="$style.PromoPage">
    <div
      :class="[$style.cardContainer, {[$style['_ready']]: isImagesLoaded}]"
      class="flex align-center justify-center"
    >
      <div
        :class="$style.card"
        :style="{ backgroundImage: `url(${cardImage})` }"
      />
      <div :class="$style.percents">
        <div
          :class="[$style.percent, $style._left]"
          :style="{ backgroundImage: `url(${cardPercent})` }"
        />
        <div
          :class="[$style.percent, $style._right]"
          :style="{ backgroundImage: `url(${cardPercent})` }"
        />
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
      animation:
        cardEntrance 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards,
        cardLoop 8s ease-in-out 1.8s infinite;
      -webkit-animation:
        cardEntrance 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards,
        cardLoop 8s ease-in-out 1.8s infinite;
    }

    .percents {
      & > *:first-child {
        animation: percentsEntrance 0.6s ease 1.2s forwards, percentsLoop 8s ease-in-out 1.8s infinite;
        -webkit-animation: percentsEntrance 0.6s ease 1.2s forwards, percentsLoop 8s ease-in-out 1.8s infinite;
      }

      & > *:last-child {
        animation: percentsEntrance 0.7s ease 1.4s forwards, percentsLoop 8s ease-in-out 2.2s infinite;
        -webkit-animation: percentsEntrance 0.7s ease 1.4s forwards, percentsLoop 8s ease-in-out 2.2s infinite;
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
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  -webkit-transform-style: preserve-3d;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  will-change: transform, opacity;
  background-image: none;
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
    -webkit-transform-style: preserve-3d;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    background-image: none;
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
    transform: translate3d(0, 100px, 0) rotateY(-179.9deg) rotateX(14deg) rotateZ(354deg) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translate3d(0, 0, 0) rotateY(0deg) rotateX(14deg) rotateZ(354deg) scale(1);
    opacity: 1;
  }
}

@keyframes percentsEntrance {
  from {
    opacity: 0;
    transform: translate3d(0, 10px, 0) rotateY(-7deg) rotateX(5deg) scale(0.75);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) rotateY(-7deg) rotateX(5deg) scale(1);
  }
}

@keyframes cardLoop {
  0%, 100% {
    transform: translate3d(0, 0, 0) rotateY(0deg) rotateX(14deg) rotateZ(354deg) scale(1);
    filter: contrast(1) saturate(1);
  }
  50% {
    transform: translate3d(0, -4px, 0) rotateY(0deg) rotateX(14deg) rotateZ(356deg) scale(1.01);
    filter: contrast(1.05) saturate(1.025);
  }
}
@keyframes percentsLoop {
  0%, 100% {
    transform: translate3d(0, 0, 0) rotateY(-7deg) rotateX(5deg) scale(1);
  }
  50% {
    transform: translate3d(0, -4px, 0) rotateY(-2deg) rotateX(2deg) scale(1.05);
  }
}
</style>
