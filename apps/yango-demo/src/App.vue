<script setup lang="ts">
import { ref } from 'vue'
import SkeletonPage from './components/skeleton/SkeletonPage.vue'
import { BaseBottomSheet } from '@tac-crypto-payment/ui'
import { useRouter } from 'vue-router'
import { setDemoCloseHandler } from './router'

const isModalOpen = ref(false)
const router = useRouter()
setDemoCloseHandler(() => {
  isModalOpen.value = false
})

const openFlow = async (
  flow: 'payment' | 'mandate',
  id: string,
) => {
  if (!id) return
  await router.push({
    name: flow === 'payment' ? 'payment.start' : 'mandate.start',
    params: flow === 'payment' ? { productId: id } : { mandateId: id },
  })
  isModalOpen.value = true
}

const openMandateTest = async () => {
  await router.push({ name: 'test-mandate-session' })
  isModalOpen.value = true
}
</script>

<template>
  <div class="host-app">
    <SkeletonPage
      @pay="openFlow('payment', $event)"
      @mandate="openFlow('mandate', $event)"
      @test-mandate-session="openMandateTest"
    />

    <BaseBottomSheet
      v-model="isModalOpen"
      full
    >
      <RouterView
        v-if="isModalOpen"
        class="payment-container"
      />
    </BaseBottomSheet>
  </div>
</template>

<style scoped>
.host-app {
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  background-color: var(--ypm-color-bg-primary);
  color: var(--ypm-color-text-primary);
  transition: background-color 0.3s, color 0.3s;
  width: 100%;
  height: 100dvh;
}

.payment-container {
  display: flex;
  flex: 1;
  flex-direction: column;
}
</style>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

*:not(dialog) {
  margin: 0;
}

body {
  margin: 0;
  background: var(--ypm-color-bg-primary);
}
</style>
