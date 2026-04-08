<script setup lang="ts">
import { ref, nextTick, watch, type App } from 'vue'
import SkeletonPage from '@/components/skeleton/SkeletonPage.vue'
import BaseBottomSheet from '@/components/base/BaseBottomSheet.vue'
import { mount } from '@/payment-entry'

const isModalOpen = ref(false)
const paymentApp = ref<App | null>(null)

const mountPaymentApp = async () => {
  isModalOpen.value = true

  await nextTick()
  if (paymentApp.value) {
    paymentApp.value.unmount()
    paymentApp.value = null
  }
  paymentApp.value = mount('#payment-container', {
    onClose: () => {
      isModalOpen.value = false
    },
  })
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
    <SkeletonPage @pay="mountPaymentApp" />

    <BaseBottomSheet v-model="isModalOpen">
      <div id="payment-container" />
    </BaseBottomSheet>
  </div>
</template>

<style scoped>
.host-app {
  width: 100%;
  height: 100dvh;
}

#payment-container {
  min-height: 400px;
}
</style>
