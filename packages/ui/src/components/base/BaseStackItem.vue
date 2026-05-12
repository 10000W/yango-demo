<script setup lang="ts">
defineProps<{
  label: string
  value?: string
}>()
</script>

<template>
  <li
    :class="$style.BaseStackItem"
    class="h4"
  >
    <div
      :class="$style.inner"
      class="flex gap-4 between"
    >
      <span v-if="label || $slots.label">
        <slot name="label">
          {{ label }}
        </slot>
      </span>

      <span :class="{'right': (label || $slots.label)}">
        <slot>
          {{ value }}
        </slot>
      </span>
    </div>
  </li>
</template>

<style module lang="scss">
.BaseStackItem {
  padding: 12px 16px;
  display: grid;
  grid-template-rows: 1fr;
}

.inner {
  min-height: 0;
}
</style>
