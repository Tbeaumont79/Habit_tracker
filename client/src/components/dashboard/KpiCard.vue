<script setup lang="ts">
interface Props {
  value: string | number
  label: string
  trend?: string
}

defineProps<Props>()
</script>

<template>
  <div class="kpi-card">
    <div class="kpi-card__value">{{ value }}</div>
    <div class="kpi-card__label">{{ label }}</div>
    <div v-if="trend" class="kpi-card__trend">
      <span class="kpi-card__trend-arrow">
        {{ trend.startsWith('-') ? '↓' : '↑' }}
      </span>
      {{ trend }}
    </div>
  </div>
</template>

<style scoped>
.kpi-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 20px;
  background: var(--surface);
  border-radius: 16px;
}

.kpi-card__value {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 40px;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}

.kpi-card__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-card__trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
  margin-top: 4px;
}

.kpi-card__trend-arrow {
  font-size: 14px;
}
</style>
