<script setup lang="ts">
</script>

<template>
  <TransitionGroup
    tag="ul"
    :class="$style.BaseStack"
    class="br-lg"
    name="expand"
  >
    <slot />
  </TransitionGroup>
</template>

<style module lang="scss">
.BaseStack {
  padding: 0;
  border: 1px solid var(--ypm-color-border-default);
  list-style: none;
  overflow: hidden;

  & > *:not(:last-child) {
    border-bottom: 1px solid var(--ypm-color-border-default);
  }
}
</style>

<style lang="scss">
.expand-enter-active,
.expand-leave-active {
  transition: grid-template-rows 0.3s ease, opacity 0.3s ease, padding 0.3s ease, border-bottom-color 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  grid-template-rows: 0fr !important;
  opacity: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  border-bottom-color: transparent !important;
}
</style>
