<script setup lang="ts">
import { inject } from 'vue'
import { BaseIcon } from '@tac-crypto-payment/ui'
import type { RouteLocationRaw, Router } from 'vue-router'

const emit = defineEmits(['back'])
const router = inject<Router>('tacPaymentRouter')

const { title = '', backRoute }
  = defineProps<{ title?: string, backDisabled?: boolean, backRoute?: RouteLocationRaw }>()

const resolveBackRoute = (): RouteLocationRaw => {
  if (backRoute) {
    return backRoute
  }

  const route = router?.currentRoute.value
  const featureRoot = route?.matched.find(record => record.name === 'payment' || record.name === 'mandate')
  if (featureRoot?.name === 'payment') {
    return { name: 'payment.start', params: route?.params }
  }
  if (featureRoot?.name === 'mandate') {
    return { name: 'mandate.start', params: route?.params }
  }
  return '/'
}

const handleBack = () => {
  emit('back')
  router?.replace(resolveBackRoute())
}
</script>

<template>
  <div
    :class="$style.PageHeader"
    class="flex between align-end gap-4"
  >
    <div>
      <BaseIcon
        v-if="!backDisabled"
        role="button"
        name="chevron-left"
        @click="handleBack"
      />
    </div>

    <p
      v-if="title"
      class="h3 center"
    >
      {{ title }}
    </p>

    <slot v-else />

    <div :class="$style.right" />
  </div>
</template>

<style module lang="scss">
.PageHeader {
  height: 54px;
  padding-bottom: 11px;
}

.right {
  width: 24px;
}
</style>
