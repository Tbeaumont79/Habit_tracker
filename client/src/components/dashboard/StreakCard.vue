<script setup lang="ts">
interface Props {
  count: number
  habitName: string
  trend?: string
}

defineProps<Props>()
</script>

<template>
  <div class="streak-card">
    <div class="streak-card__flame">🔥</div>
    <div class="streak-card__count">{{ count }}</div>
    <div class="streak-card__suffix">day streak</div>
    <div class="streak-card__name">{{ habitName }}</div>
    <div v-if="trend" class="streak-card__trend">
      <span class="streak-card__trend-arrow">{{ trend.startsWith('-') ? '↓' : '↑' }}</span>
      <span>{{ trend }}</span>
    </div>
  </div>
</template>

<style scoped>
.streak-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 16px;
  background: var(--surface);
  border-radius: 16px;
  text-align: center;
}

.streak-card__flame {
  font-size: 32px;
  line-height: 1;
}

.streak-card__count {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 40px;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}

.streak-card__suffix {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.streak-card__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 4px;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.streak-card__trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--accent);
  font-weight: 500;
  margin-top: 4px;
}

.streak-card__trend-arrow {
  font-size: 14px;
}
</style>
