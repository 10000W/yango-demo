<script setup lang="ts">
import { ref, onMounted, computed, inject } from 'vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import { useRoute, useRouter } from 'vue-router'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { usePayment } from '@/composables/usePayment'
import { useAppKit } from '@/composables/useAppKit'
import { until } from '@vueuse/core'
import type { TacPaymentUIConfig } from '@/TacPaymentUI'
import { useMandate } from '@/composables/useMandate'

const config = inject<TacPaymentUIConfig>('tacPaymentUiConfig')!
const isAccoladeVisible = true

const route = useRoute()
const router = useRouter()
const { isLoaded: isAppKitLoaded, init: initAppKit } = useAppKit()
const isLoading = ref(true)

const isGlowVisible = computed(() => ['promo'].includes(route.name as string))

onMounted(async () => {
  if (config.skipSetup) {
    console.log('Skipping setup...')
    initAppKit()
    await until(isAppKitLoaded).toBe(true)
    isLoading.value = false
    return
  }

  try {
    if (config.flow === 'mandate') {
      const { init } = useMandate()
      await init()
      initAppKit()
    }
    else {
      const { init, product } = usePayment()
      await init(config)
      if (!product.value) {
        throw new Error('Product not found')
      }
      initAppKit(product.value)
    }

    await until(isAppKitLoaded).toBe(true)
    isLoading.value = false
  }
  catch (e) {
    console.error(e)
    await router.replace({
      name: 'error',
      query: {
        title: 'Initialization failed',
        message: `We could not initialize the ${config.flow} system. Please check your connection and try again.`,
      },
    })
    isLoading.value = false
  }
})
</script>

<template>
  <main
    class="tac-crypto-payment"
    :class="[$style.viewport, {[$style._glow]: isGlowVisible}]"
  >
    <div
      v-if="isLoading"
      :class="$style.loader"
    >
      <div class="column align-center gap-12">
        <BaseSpinner>
          <BaseIcon
            style="color: var(--ypm-color-brand-primary)"
            name="tac"
            size="38"
          />
        </BaseSpinner>

        <p class="w-500">
          Loading...
        </p>
      </div>
    </div>
    <RouterView
      v-else
      v-slot="{ Component }"
    >
      <Transition
        name="fade"
        mode="out-in"
      >
        <component
          :is="Component"
          :key="route.path"
        />
      </Transition>
    </RouterView>

    <small
      v-if="isAccoladeVisible"
      class="flex align-center justify-center gap-6 c-text-secondary p3 w-500 p-24"
    >
      <BaseIcon
        :size="22"
        name="tac"
      />
      Powered by TAC
    </small>
  </main>
</template>

<style module lang="scss">
.loader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewport {
  display: flex;
  flex-direction: column;
  flex: 1;
  //overflow: auto;
  padding-top: 52px;

  & > *:first-child {
    flex-grow: 1;
    padding: 0 16px;
  }

  &._glow {
    background:
      radial-gradient(circle, #FF1A1A -20%, rgba(255, 255, 255, 0) 60%) no-repeat 0 -450px
  }
}

</style>

<style lang="scss">
@use "@/assets/styles/main" as *;

.fade-enter-active {
  transition: opacity .2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
