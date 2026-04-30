<script setup lang="ts">
</script>

<template>
  <div
    class="flex align-center justify-center"
    :class="$style.spinner"
  >
    <slot />
  </div>
</template>

<style module lang="scss">
.spinner {
  position: relative;
  width: 72px;
  height: 72px;
  border: 2px solid var(--ypm-color-border-default);
  border-radius: 50%;

  &:before {
    content: "";
    position: absolute;
    top: -2px;
    left: -2px;
    width: 72px;
    height: 72px;
    border-radius: inherit;
    border: 2px solid var(--ypm-color-brand-primary);
    border-top: 2px solid transparent;
    border-right: 2px solid transparent;
    border-bottom: 2px solid transparent;
    transform-origin: center;
    animation: rotation 1.5s linear infinite;
  }
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
