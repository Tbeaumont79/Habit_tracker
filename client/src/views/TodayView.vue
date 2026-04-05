<script setup lang="ts">
import TodayChecklist from '@/components/tracking/TodayChecklist.vue'

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
</script>

<template>
  <div class="today-page">
    <div class="today-container">
      <!-- Page header -->
      <div class="today-header">
        <h1 class="today-header__title">Today</h1>
        <p class="today-header__date">{{ today }}</p>
      </div>

      <!-- Checklist -->
      <TodayChecklist />
    </div>
  </div>
</template>

<style scoped>
.today-page {
  min-height: 100vh;
  background: var(--bg);
  padding: 32px 16px;
}

.today-container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.today-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.today-header__title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: var(--text);
}

.today-header__date {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--text-muted);
}
</style>
