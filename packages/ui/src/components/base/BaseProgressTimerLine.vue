<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import BaseProgress from './BaseProgress.vue'

const props = defineProps<{
  duration: number
}>()

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const timeLeft = ref(props.duration)
const endTime = ref<number | null>(null)
const timer = ref<ReturnType<typeof setTimeout> | null>(null)
const isExpired = ref(false)

const hours = computed(() => Math.floor(Math.max(0, timeLeft.value) / 3600))
const minutes = computed(() => Math.floor((Math.max(0, timeLeft.value) % 3600) / 60))
const seconds = computed(() => Math.floor(Math.max(0, timeLeft.value) % 60))
const timeFormatted = computed(() => {
  const h = hours.value.toString().padStart(2, '0')
  const m = minutes.value.toString().padStart(2, '0')
  const s = seconds.value.toString().padStart(2, '0')
  return hours.value > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
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
  <div :class="$style.BaseProgressTimerLine">
    <div
      v-if="$slots.default || timeFormatted"
      :class="$style.label"
    >
      <slot :time-formatted="timeFormatted">
        {{ timeFormatted }}
      </slot>
    </div>
    <BaseProgress
      v-model="timeLeft"
      :max="duration"
    />
  </div>
</template>

<style lang="scss" module>
.BaseProgressTimerLine {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.label {
  color: var(--ypm-color-text-secondary);
}
</style>
