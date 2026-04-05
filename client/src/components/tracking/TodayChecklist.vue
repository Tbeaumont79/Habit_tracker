<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useHabitsStore } from '@/stores/habits'
import { useTrackingStore } from '@/stores/tracking'
import HabitCheckItem from './HabitCheckItem.vue'

const habitsStore = useHabitsStore()
const trackingStore = useTrackingStore()

const activeHabits = computed(() => habitsStore.habits.filter((h) => !h.isArchived))

const doneCount = computed(
  () => activeHabits.value.filter((h) => trackingStore.isCompleted(h.id)).length,
)

const totalCount = computed(() => activeHabits.value.length)

async function handleToggle(habitId: string) {
  await trackingStore.toggleHabit(habitId)
}

onMounted(async () => {
  await Promise.all([habitsStore.fetchHabits(), trackingStore.fetchTodayLogs()])
})
</script>

<template>
  <div class="checklist">
    <!-- Header -->
    <div class="checklist__header">
      <h2 class="checklist__title">Today's Habits</h2>
      <span class="checklist__counter">
        {{ doneCount }}<span class="checklist__counter-total">/{{ totalCount }} done</span>
      </span>
    </div>

    <!-- Loading state -->
    <div v-if="trackingStore.loading || habitsStore.loading" class="checklist__loading">
      <span>Loading…</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="activeHabits.length === 0" class="checklist__empty">
      <p>No habits yet. Add your first habit to get started!</p>
    </div>

    <!-- Habit list -->
    <ul v-else class="checklist__list" role="list">
      <li v-for="habit in activeHabits" :key="habit.id" class="checklist__list-item">
        <HabitCheckItem
          :habit="habit"
          :checked="trackingStore.isCompleted(habit.id)"
          @toggle="handleToggle(habit.id)"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.checklist {
  background: var(--surface);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 24px rgba(45, 43, 61, 0.06);
  padding: 20px 8px 12px;
}

.checklist__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 16px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 8px;
}

.checklist__title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.checklist__counter {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
}

.checklist__counter-total {
  font-weight: 400;
  color: var(--text-muted);
}

.checklist__loading,
.checklist__empty {
  padding: 24px 16px;
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--text-muted);
}

.checklist__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.checklist__list-item {
  display: block;
}
</style>
