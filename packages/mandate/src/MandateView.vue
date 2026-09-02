<script setup lang="ts">
import { ref, onMounted, inject, provide, watch } from 'vue'
import { BaseSpinner } from '@tac-crypto-payment/ui'
import { useRoute, useRouter } from 'vue-router'
import { BaseIcon } from '@tac-crypto-payment/ui'
import { useAppKit } from '@tac-crypto-payment/runtime'
import { until } from '@vueuse/core'
import type { MandateConfig } from './types'
import { useMandate } from './useMandate'

const config = inject<MandateConfig>('tacPaymentUiConfig')!
const isAccoladeVisible = true

const route = useRoute()
const router = useRouter()
provide('tacPaymentRouter', router)
const { isLoaded: isAppKitLoaded, init: initAppKit } = useAppKit()
const isLoading = ref(true)
const errorDetails = ref<{ title: string, message: string } | null>(null)

const redirectExpiredOrRevokedMandate = () => {
  const { isExpiredOrRevoked } = useMandate()
  if (isExpiredOrRevoked.value && route.name !== 'mandate.start') {
    return router.replace({
      name: 'mandate.start',
      params: { mandateId: route.params.mandateId },
    })
  }
}

watch(() => useMandate().isExpiredOrRevoked.value, redirectExpiredOrRevokedMandate)

onMounted(async () => {
  if (config.skipSetup) {
    initAppKit()
    await until(isAppKitLoaded).toBe(true)
    isLoading.value = false
    return
  }

  try {
    const { init } = useMandate()
    await init()
    await redirectExpiredOrRevokedMandate()
    initAppKit()

    await until(isAppKitLoaded).toBe(true)
    isLoading.value = false
  }
  catch (e) {
    console.error(e)
    errorDetails.value = {
      title: 'Initialization failed',
      message: 'We could not initialize the mandate system. Please check your connection and try again.',
    }
    await router.replace({
      name: 'mandate.error',
    })
    isLoading.value = false
  }
})
</script>

<template>
  <main
    class="tac-crypto-payment"
    :class="$style.viewport"
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
          v-bind="route.name === 'mandate.error' ? errorDetails || {} : {}"
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
}

</style>

<style lang="scss">
.fade-enter-active {
  transition: opacity .2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
