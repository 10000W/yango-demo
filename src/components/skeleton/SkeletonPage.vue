<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'

defineEmits<{
  pay: []
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
        <BaseButton
          style="align-self: flex-start"
          color="danger"
          size="small"
          @click="$emit('pay')"
        >
          Pay with Crypto
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
  background: var(--c-bg);
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
  background: var(--c-bg-mute);
}

.rectShort {
  width: 100px;
  height: 20px;
  border-radius: 4px;
  background: var(--c-bg-mute);
}

.hero {
  width: 100%;
  height: 240px;
  border-radius: 16px;
  background: var(--c-bg-mute);
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
  background: var(--c-bg-mute);
}

.rectHalf {
  width: 60%;
  height: 14px;
  border-radius: 4px;
  background: var(--c-bg-mute);
}

.footer {
  margin-top: auto;
  padding-bottom: 24px;
}
</style>
