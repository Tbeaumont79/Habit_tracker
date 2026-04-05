<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryData } from '@/types/stats'

interface Props {
  data: CategoryData[]
}

const props = defineProps<Props>()

const COLORS = [
  'var(--primary)',
  'var(--secondary)',
  'var(--accent)',
  'var(--warning)',
  'var(--primary-light)',
  'var(--secondary-light)',
  'var(--accent-light)',
  'var(--warning-light)',
]

const SIZE = 120
const STROKE_WIDTH = 28
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const CENTER = SIZE / 2

interface Segment {
  category: string
  color: string
  dasharray: string
  dashoffset: number
  percentage: number
  count: number
}

const segments = computed<Segment[]>(() => {
  let cumulativeOffset = 0
  // Start from the top (rotate -90 degrees applied via transform on SVG)
  return props.data.map((item, idx) => {
    const arc = item.percentage * CIRCUMFERENCE
    const offset = CIRCUMFERENCE - cumulativeOffset
    cumulativeOffset += arc
    return {
      category: item.category,
      color: COLORS[idx % COLORS.length],
      dasharray: `${arc} ${CIRCUMFERENCE - arc}`,
      dashoffset: offset,
      percentage: item.percentage,
      count: item.count,
    }
  })
})
</script>

<template>
  <div class="donut">
    <svg
      :width="SIZE"
      :height="SIZE"
      :viewBox="`0 0 ${SIZE} ${SIZE}`"
      class="donut__svg"
    >
      <!-- Background track -->
      <circle
        :cx="CENTER"
        :cy="CENTER"
        :r="RADIUS"
        fill="none"
        :stroke="'var(--border)'"
        :stroke-width="STROKE_WIDTH"
      />

      <!-- Segments -->
      <circle
        v-for="(seg, idx) in segments"
        :key="idx"
        :cx="CENTER"
        :cy="CENTER"
        :r="RADIUS"
        fill="none"
        :stroke="seg.color"
        :stroke-width="STROKE_WIDTH"
        :stroke-dasharray="seg.dasharray"
        :stroke-dashoffset="seg.dashoffset"
        transform="rotate(-90)"
        :transform-origin="`${CENTER} ${CENTER}`"
      />
    </svg>

    <!-- Legend -->
    <div class="donut__legend">
      <div
        v-for="(seg, idx) in segments"
        :key="idx"
        class="donut__legend-item"
      >
        <span
          class="donut__legend-dot"
          :style="{ background: seg.color }"
        />
        <span class="donut__legend-name">{{ seg.category }}</span>
        <span class="donut__legend-pct">{{ Math.round(seg.percentage * 100) }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.donut {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.donut__svg {
  flex-shrink: 0;
}

.donut__legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.donut__legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.donut__legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.donut__legend-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  flex: 1;
}

.donut__legend-pct {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
</style>
