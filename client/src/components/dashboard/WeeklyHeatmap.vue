<script setup lang="ts">
import { computed } from 'vue'
import type { HeatmapData } from '@/types/stats'

interface Props {
  data: HeatmapData[]
}

defineProps<Props>()

const dayLabels = computed(() => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const labels: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    labels.push(days[d.getDay()])
  }
  return labels
})

function cellClass(completed: boolean): string {
  return completed ? 'heatmap__cell heatmap__cell--done' : 'heatmap__cell heatmap__cell--empty'
}
</script>

<template>
  <div class="heatmap">
    <!-- Day labels header -->
    <div class="heatmap__row heatmap__row--header">
      <div class="heatmap__habit-label" />
      <div
        v-for="day in dayLabels"
        :key="day"
        class="heatmap__day-label"
      >
        {{ day }}
      </div>
    </div>

    <!-- Habit rows -->
    <div
      v-for="item in data"
      :key="item.habitId"
      class="heatmap__row"
    >
      <div class="heatmap__habit-label" :title="item.habitName">
        {{ item.habitName }}
      </div>
      <div
        v-for="(completed, idx) in item.days"
        :key="idx"
        :class="cellClass(completed)"
        :title="completed ? 'Completed' : 'Not completed'"
      />
    </div>
  </div>
</template>

<style scoped>
.heatmap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-x: auto;
}

.heatmap__row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.heatmap__row--header {
  margin-bottom: 2px;
}

.heatmap__habit-label {
  width: 80px;
  min-width: 80px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 8px;
}

.heatmap__day-label {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.heatmap__cell {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
  transition: transform 0.1s ease;
  cursor: default;
}

.heatmap__cell:hover {
  transform: scale(1.15);
}

.heatmap__cell--empty {
  background-color: var(--accent-light);
  opacity: 0.3;
}

.heatmap__cell--done {
  background-color: var(--accent);
}
</style>
