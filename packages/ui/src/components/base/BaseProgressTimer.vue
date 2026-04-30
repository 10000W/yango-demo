<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  duration: number
  size?: number
  strokeWidth?: number
  color?: string
}>()

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const {
  size = 16,
  strokeWidth = 2,
  color = 'var(--ypm-color-brand-primary)',
} = props

const timeLeft = ref(props.duration)
const endTime = ref<number | null>(null)
const timer = ref<ReturnType<typeof setTimeout> | null>(null)
const isExpired = ref(false)

const radius = (size - strokeWidth) / 2
const circumference = 2 * Math.PI * radius

const progress = computed(() => {
  return (timeLeft.value / props.duration) * circumference
})

const minutes = computed(() => Math.floor(Math.max(0, timeLeft.value) / 60))
const seconds = computed(() => Math.floor(Math.max(0, timeLeft.value) % 60))
const timeFormatted = computed(() => {
  const m = minutes.value.toString().padStart(2, '0')
  const s = seconds.value.toString().padStart(2, '0')
  return `${m}:${s}`
})

const updateTimer = () => {
  if (!endTime.value) return

  const now = Date.now()
  const remaining = Math.ceil((endTime.value - now) / 1000)

  if (remaining <= 0) {
    timeLeft.value = 0
    stopTimer()
    if (!isExpired.value) {
      isExpired.value = true
      emit('complete')
    }
  }
  else {
    timeLeft.value = remaining
  }
}

const startTimer = () => {
  endTime.value = Date.now() + props.duration * 1000
  updateTimer()
  timer.value = setInterval(updateTimer, 1000)
}

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    updateTimer()
  }
}

defineExpose({
  timeLeft,
  timeFormatted,
  isExpired,
})

onMounted(() => {
  startTimer()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stopTimer()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div
    :class="$style.BaseProgressTimer"
    class="flex align-center gap-6"
  >
    <div
      :class="$style.circle"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <svg
        :width="size"
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
        :class="$style.svg"
      >
        <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="transparent"
          :stroke-width="strokeWidth"
          :class="$style.background"
        />
        <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="transparent"
          :stroke-width="strokeWidth"
          :stroke="color"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="circumference - progress"
          stroke-linecap="round"
          :class="$style.progress"
        />
      </svg>
    </div>

    <div
      v-if="$slots.default"
      :class="$style.label"
      :style="{ color }"
    >
      <slot :time-formatted="timeFormatted">
        {{ timeFormatted }}
      </slot>
    </div>
  </div>
</template>

<style module lang="scss">
.BaseProgressTimer {
  //
}

.circle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.svg {
  transform: rotate(-90deg);
}

.background {
  stroke: var(--ypm-color-border-default);
}

.progress {
  transition: stroke-dashoffset 1s linear;
}

.label {
  font-family: monospace;
  font-variant-numeric: tabular-nums;
}
</style>
