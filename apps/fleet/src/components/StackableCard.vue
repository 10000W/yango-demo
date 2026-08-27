<script setup lang="ts">

</script>

<template>
  <div :class="$style.StackableCard">
    <slot />
  </div>
</template>

<style module lang="scss">
.StackableCard {
  padding: 16px 24px;
  background: var(--ypm-color-btn-secondary-bg);
  border-radius: 0;

  &:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }

  &:last-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
}
</style>
