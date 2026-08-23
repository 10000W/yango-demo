<script setup lang="ts">
import { BaseButton, BaseInput } from '@tac-crypto-payment/ui'
import { ref } from 'vue'

const mandateSessionId = ref('')
const productId = ref('')
defineEmits<{
  'pay': [productId: string]
  'test': [productId: string]
  'mandate': [sessionId: string]
  'test-mandate-session': [productId: string]
}>()
</script>

<template>
  <div :class="$style.skeleton">
    <div :class="$style.container">
      <div :class="$style.header">
        <div :class="$style.circle" />
        <div :class="$style.rectShort" />
      </div>

      <div :class="$style.hero" />

      <div :class="$style.rows">
        <div :class="$style.rect" />
        <div :class="$style.rectHalf" />
        <div :class="$style.rect" />
        <BaseInput
          v-model="productId"
          placeholder="Product id (abcd1234-.....)"
        />
        <BaseButton
          style="align-self: flex-start"
          variant="danger"
          @click="$emit('pay', productId)"
        >
          Pay with Crypto
        </BaseButton>
        <br>

        <BaseInput
          v-model="mandateSessionId"
          placeholder="Mandate session id (abcd1234-.....)"
        />
        <BaseButton
          style="align-self: flex-start"
          variant="danger"
          @click="$emit('mandate', mandateSessionId)"
        >
          Manage mandate
        </BaseButton>

        <br>
        <BaseButton
          style="align-self: flex-start"
          variant="danger"
          @click="$emit('test', productId)"
        >
          Test connections
        </BaseButton>

        <BaseButton
          style="align-self: flex-start"
          variant="secondary"
          @click="$emit('test-mandate-session', productId)"
        >
          Test mandate session
        </BaseButton>

        <div :class="$style.rect" />
        <div :class="$style.rect" />
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.skeleton {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: var(--ypm-color-bg-primary);
  padding: 24px;
  align-items: center;
}

.container {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 24px;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
}

.circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--ypm-color-bg-secondary);
}

.rectShort {
  width: 100px;
  height: 20px;
  border-radius: 4px;
  background: var(--ypm-color-bg-secondary);
}

.hero {
  width: 100%;
  height: 240px;
  border-radius: 16px;
  background: var(--ypm-color-bg-secondary);
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rect {
  width: 100%;
  height: 14px;
  border-radius: 4px;
  background: var(--ypm-color-bg-secondary);
}

.rectHalf {
  width: 60%;
  height: 14px;
  border-radius: 4px;
  background: var(--ypm-color-bg-secondary);
}

.footer {
  margin-top: auto;
  padding-bottom: 24px;
}
</style>
