<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Props {
  percentage: number
}

const props = defineProps<Props>()

const SIZE = 140
const STROKE_WIDTH = 8
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const gradientId = `completion-gradient-${Math.random().toString(36).slice(2, 8)}`

const animatedPercentage = ref(0)

const dashoffset = computed(() => {
  const clipped = Math.min(1, Math.max(0, animatedPercentage.value))
  return CIRCUMFERENCE * (1 - clipped)
})

const displayPercent = computed(() => Math.round(props.percentage * 100))

onMounted(() => {
  // Animate from 0 to target over 600ms ease-out
  const target = props.percentage
  const start = performance.now()
  const duration = 600

  function easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }

  function step(now: number) {
    const elapsed = now - start
    const t = Math.min(elapsed / duration, 1)
    animatedPercentage.value = easeOut(t) * target
    if (t < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
})
</script>

<template>
  <div class="completion-circle">
    <svg :width="SIZE" :height="SIZE" :viewBox="`0 0 ${SIZE} ${SIZE}`">
      <defs>
        <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--primary)" />
          <stop offset="100%" stop-color="var(--secondary)" />
        </linearGradient>
      </defs>

      <!-- Track -->
      <circle
        :cx="SIZE / 2"
        :cy="SIZE / 2"
        :r="RADIUS"
        fill="none"
        :stroke="'var(--border)'"
        :stroke-width="STROKE_WIDTH"
      />

      <!-- Fill -->
      <circle
        :cx="SIZE / 2"
        :cy="SIZE / 2"
        :r="RADIUS"
        fill="none"
        :stroke="`url(#${gradientId})`"
        :stroke-width="STROKE_WIDTH"
        stroke-linecap="round"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="dashoffset"
        transform="rotate(-90)"
        :transform-origin="`${SIZE / 2} ${SIZE / 2}`"
      />
    </svg>

    <div class="completion-circle__text">
      <span class="completion-circle__percent">{{ displayPercent }}%</span>
      <span class="completion-circle__label">complete</span>
    </div>
  </div>
</template>

<style scoped>
.completion-circle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 140px;
}

.completion-circle__text {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.completion-circle__percent {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}

.completion-circle__label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
