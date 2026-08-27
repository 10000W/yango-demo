<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDeposit } from '@/composables/useDeposit.ts'
import BaseIcon from '@tac-crypto-payment/ui/components/base/BaseIcon.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import { BaseSpinner } from '@tac-crypto-payment/ui'

const { isLoading, load } = useDeposit()
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  if (route.params.depositId) {
    try {
      const { id, status } = await load(route.params.depositId as string)
      const routeName = status === 'draft' ? 'deposit-setup' : 'deposit-form'
      router.replace({
        name: routeName,
        params: { depositId: id },
      })
    }
    catch {
      router.replace({
        name: 'error',
        params: { depositId: route.params.depositId },
        query: route.query,
      })
    }
  }
})
</script>

<template>
  <div class="column align-center justify-center flex-1">
    <TheHeader />

    <div
      :class="$style.content"
      class="container flex-1 column"
    >
      <div
        v-if="isLoading"
        class="flex justify-center py-64"
      >
        <BaseSpinner>
          <BaseIcon
            style="color: var(--ypm-color-brand-primary)"
            name="tac"
            :size="38"
          />
        </BaseSpinner>
      </div>
      <RouterView
        v-slot="{ Component }"
      >
        <component
          :is="Component"
          v-show="!isLoading"
        />
      </RouterView>
    </div>

    <TheFooter />
  </div>
</template>

<style module>
.content {
  padding-top: calc(74px + 32px);
  padding-bottom: 32px;
}
</style>

<style>
main {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.container {
  width: 100%;
  max-width: 1032px;
  padding-left: 16px;
  padding-right: 16px;
  flex-grow: 1;
}
</style>
