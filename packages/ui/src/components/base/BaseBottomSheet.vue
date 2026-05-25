<script setup lang="ts">
import { ref, watch } from 'vue'

const { to = 'body', modelValue } = defineProps<{
  to?: string
  full?: boolean
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

const sheetRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const dragY = ref(0)
const startY = ref(0)
const isOpen = ref(false)
const isDragging = ref(false)

const onTouchStart = (e: TouchEvent) => {
  if (!e.touches[0]) {
    return
  }
  startY.value = e.touches[0].clientY
  isDragging.value = true
}
const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || !e.touches[0]) return
  const currentY = e.touches[0].clientY
  const diff = currentY - startY.value
  if (diff > 0) {
    dragY.value = diff
  }
}
const onTouchEnd = () => {
  if (dragY.value > 100) {
    close()
  }
  else {
    isDragging.value = false
    dragY.value = 0
  }
}
const close = () => {
  emit('update:modelValue', false)
  emit('close')
  dragY.value = 0
  isDragging.value = false
}

watch(() => modelValue, (v) => {
  if (v) {
    isOpen.value = true
    document.body.style.overflow = 'hidden'
  }
  else {
    setTimeout(() => {
      isOpen.value = false
    }, 300) // Match transition
    document.body.style.overflow = ''
  }
}, { immediate: true })

</script>

<template>
  <Teleport :to="to">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="overlay"
        @click="close"
      />
    </Transition>
    <Transition name="slide">
      <div
        v-if="modelValue"
        ref="containerRef"
        class="container"
      >
        <div
          ref="sheetRef"
          :class="['sheet', isDragging && 'isDragging', full && 'full']"
          :style="{ transform: `translateY(${dragY}px)` }"
        >
          <div
            v-if="!full"
            class="dragZone"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          >
            <div class="handle" />
          </div>
          <div class="content">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.container {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 1001;
  pointer-events: none;

  @media (min-width: 640px) {
    align-items: center;
    justify-content: center;
  }
}

.sheet {
  contain: content;
  background: var(--ypm-color-bg-primary);
  border-radius: 24px 24px 0 0;
  max-height: 90dvh;
  width: 100%;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;

  @media (min-width: 640px) {
    border-radius: 24px;
    width: 500px;
    max-height: 80dvh;
  }
}

.isDragging {
  transition: none !important;
}

.full {
  height: 80dvh;

  @media (max-width: 639px) {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }
}

.handle {
  width: 40px;
  height: 4px;
  background: var(--ypm-color-border-default);
  border-radius: 2px;
  margin: 12px auto;
  flex-shrink: 0;

  @media (min-width: 640px) {
    display: none;
  }
}

.dragZone {
  padding-bottom: 4px;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.header {
  padding: 0 16px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.closeBtn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  color: var(--c-text-soft);
}

.content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  background: var(--ypm-color-bg-primary);

  &::-webkit-scrollbar {
    display: none;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from, .slide-leave-to {
  transform: translateY(100%);
}
</style>
