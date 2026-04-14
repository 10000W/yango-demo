<script setup lang="ts">
import { ref } from 'vue'

const { label, openLabel, initialOpen = false } = defineProps<{
  label: string
  openLabel?: string
  initialOpen?: boolean
}>()

const isOpen = ref(initialOpen)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div :class="$style.BaseSpoiler">
    <button
      type="button"
      :class="$style.trigger"
      @click="toggle"
    >
      <span :class="$style.label">
        {{ isOpen && openLabel ? openLabel : label }}
      </span>
      <span
        :class="[$style.chevron, isOpen && $style['is-open']]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </button>
    <div
      v-if="isOpen"
      :class="$style.content"
    >
      <slot />
    </div>
  </div>
</template>

<style module lang="scss">
.BaseSpoiler {
  width: 100%;
}

.trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--c-primary);
  font-size: 14px;
  font-weight: 500;
  gap: 4px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}

.label {
  user-select: none;
}

.chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  &.is-open {
    transform: rotate(180deg);
  }
}

.content {
  padding-top: 16px;
}
</style>
