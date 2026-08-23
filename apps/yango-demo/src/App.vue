<script setup lang="ts">
import { ref, nextTick, watch, type App } from 'vue'
import SkeletonPage from './components/skeleton/SkeletonPage.vue'
import { BaseBottomSheet, TacPaymentUI } from '@tac-crypto-payment/ui'
const isModalOpen = ref(false)
const paymentApp = ref<App | null>(null)

const mountPaymentApp = async (
  routeName?: 'test' | 'payment' | 'test-mandate-session' | 'mandate',
  productOrMandateSessionId?: string,
) => {
  isModalOpen.value = true

  await nextTick()
  if (paymentApp.value) {
    paymentApp.value.unmount()
    paymentApp.value = null
  }

  const payment = new TacPaymentUI({
    flow: routeName === 'mandate' ? 'mandate' : 'payment',
    productId: routeName === 'test' || routeName === 'test-mandate-session'
      ? '12345678-1234-4444-4444-123456789012'
      : routeName === 'mandate' ? '' : productOrMandateSessionId!,
    mandateId: routeName === 'mandate' ? productOrMandateSessionId! : '',
    payzapUrl: 'https://staging-api.payzap.cc',
    elementSelector: '#payment-container',
    onClose: () => {
      isModalOpen.value = false
      // TODO: closing logic
      // if (window) {
      //   window.close()
      // }
    },
  })

  paymentApp.value = payment.mount()
  if (routeName !== 'payment' && routeName !== 'mandate') {
    const router = paymentApp.value?.config?.globalProperties?.$router
    if (router) {
      router.push({ name: routeName })
    }
  }
}

watch(isModalOpen, (isOpen) => {
  if (!isOpen && paymentApp.value) {
    setTimeout(() => {
      if (!isModalOpen.value && paymentApp.value) {
        paymentApp.value.unmount()
        paymentApp.value = null
      }
    }, 400)
  }
})
</script>

<template>
  <div class="host-app">
    <SkeletonPage
      @pay="mountPaymentApp('payment', $event)"
      @test="mountPaymentApp('test', $event)"
      @mandate="mountPaymentApp('mandate', $event)"
      @test-mandate-session="mountPaymentApp('test-mandate-session', $event)"
    />

    <BaseBottomSheet
      v-model="isModalOpen"
      full
    >
      <div
        id="payment-container"
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
