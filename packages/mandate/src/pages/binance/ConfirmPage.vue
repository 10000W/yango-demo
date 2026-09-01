<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useMandate } from '../../useMandate'
import { PageHeader } from '@tac-crypto-payment/runtime'
import { BaseAlert, BaseButton, BaseIcon } from '@tac-crypto-payment/ui'
import { onMounted, onUnmounted, watch } from 'vue'
import QrcodeVue from 'qrcode.vue'

const router = useRouter()
const { status, binance, poll } = useMandate()

onMounted(() => {
  poll.resume()
})

onUnmounted(() => {
  poll.pause()
})

watch(status, (val) => {
  if (val === 'revoked' || val === 'expired') {
    router.replace({ name: 'mandate.start' })
  }

  if (val === 'active') {
    router.replace({ name: 'mandate.status' })
  }
}, { immediate: true })
</script>

<template>
  <div class="column flex-1 gap-16">
    <div class="column flex-1 gap-16">
      <PageHeader
        title="Confirm in Binance"
        :back-route="{ name: 'mandate.start' }"
      />

      <p
        v-if="binance.setupData.qrcodeLink && binance.setupData.deeplink"
        class="c-text-secondary center"
      >
        Scan with the Binance app, or open it directly on this device.
      </p>

      <p
        v-else-if="binance.setupData.deeplink"
        class="c-text-secondary center"
      >
        Open a link by pressing button below and follow instructions in Binance app.
      </p>

      <div class="flex justify-center">
        <QrcodeVue
          v-if="binance.setupData.qrcodeLink"
          :value="binance.setupData.qrcodeLink"
          :size="220"
          level="M"
          :class="$style.qr"
        />
        <BaseAlert
          v-else-if="!binance.setupData.qrcodeLink && !binance.setupData.deeplink"
          variant="error"
        >
          Unable to create a lnk to binance. Please go back and try again.
        </BaseAlert>
      </div>

      <p
        v-if="binance.setupData.deeplink || binance.setupData.qrcodeLink"
        class="flex gap-8 align-center mx-auto c-text-secondary"
      >
        <BaseIcon name="loading" />
        Waiting for confirmation...
      </p>
    </div>

    <BaseButton
      wide
      :disabled="!binance.setupData.deeplink"
      :href="binance.setupData.deeplink"
      target="_blank"
      class="gap-8"
    >
      <BaseIcon name="link" />
      Open in Binance
    </BaseButton>
  </div>
</template>

<style module lang="scss">
.switch {
  width: 44px;
  height: 24px;
  background: var(--ypm-color-bg-tertiary);
  border: 1px solid var(--ypm-color-border-default);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;

  &._active {
    background: var(--ypm-color-brand-primary);
    border-color: var(--ypm-color-brand-primary);
  }
}

.qr {
  padding: 10px;
  background: white;
  border-radius: 12px;
}
</style>
