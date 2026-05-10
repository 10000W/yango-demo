<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import { useRoute } from 'vue-router'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { usePayment } from '@/composables/usePayment'

const route = useRoute()
const { init } = usePayment()
const isLoading = ref(true)

const isGlowVisible = computed(() => ['promo'].includes(route.name as string))
const isAccoladeVisible = true

onMounted(() => {
  init()
  isLoading.value = false
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
  overflow: auto;
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

.accoladeTac {
  width: 16px;
  height: 16px;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url(@/assets/images/tac.png);
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
