<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
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
  startY.value = e.touches[0].clientY
  isDragging.value = true
}
const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
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

watch(() => props.modelValue, (v) => {
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
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        :class="$style.overlay"
        @click="close"
      />
    </Transition>
    <Transition name="slide">
      <div
        v-if="modelValue"
        ref="containerRef"
        :class="$style.container"
      >
        <div
          ref="sheetRef"
          :class="[$style.sheet, isDragging && $style.isDragging]"
          :style="{ transform: `translateY(${dragY}px)` }"
        >
          <div
            :class="$style.dragZone"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          >
            <div :class="$style.handle" />
          </div>
          <div :class="$style.content">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style module lang="scss">
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
}

.sheet {
  background: var(--c-bg);
  border-radius: 24px 24px 0 0;
  max-height: 90dvh;
  width: 100%;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.isDragging {
  transition: none !important;
}

.handle {
  width: 40px;
  height: 4px;
  background: var(--c-border);
  border-radius: 2px;
  margin: 12px auto;
  flex-shrink: 0;
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
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 32px;
}
</style>

<style scoped>
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
