<script setup lang="ts">
import type { Habit } from '@/types/habit'

const props = defineProps<{
  habit: Habit
}>()

const emit = defineEmits<{
  (e: 'edit', habit: Habit): void
  (e: 'archive', habit: Habit): void
  (e: 'delete', habit: Habit): void
}>()

function iconBg(color: string): string {
  // Convert hex to a light pastel version by mixing with white at 80%
  return `${color}33`
}

const frequencyLabel: Record<Habit['frequency'], string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  CUSTOM: 'Custom',
}
</script>

<template>
  <article class="habit-card" :class="{ archived: props.habit.isArchived }">
    <div class="card-main">
      <div class="icon-circle" :style="{ background: iconBg(props.habit.color), color: props.habit.color }">
        <span class="icon-emoji">{{ props.habit.icon || '✨' }}</span>
      </div>

      <div class="card-info">
        <h3 class="habit-name">{{ props.habit.name }}</h3>
        <div class="meta">
          <span class="freq-badge">{{ frequencyLabel[props.habit.frequency] }}</span>
          <span v-if="props.habit.category" class="cat-badge">{{ props.habit.category }}</span>
          <span v-if="props.habit.isArchived" class="archived-badge">Archived</span>
        </div>
        <p v-if="props.habit.description" class="description">{{ props.habit.description }}</p>
      </div>
    </div>

    <div class="card-actions">
      <button class="icon-btn edit-btn" title="Edit" @click="emit('edit', props.habit)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>

      <button class="icon-btn archive-btn" :title="props.habit.isArchived ? 'Unarchive' : 'Archive'" @click="emit('archive', props.habit)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="21 8 21 21 3 21 3 8"/>
          <rect x="1" y="3" width="22" height="5"/>
          <line x1="10" y1="12" x2="14" y2="12"/>
        </svg>
      </button>

      <button class="icon-btn delete-btn" title="Delete" @click="emit('delete', props.habit)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/>
          <path d="M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>
  </article>
</template>

<style scoped>
.habit-card {
  background: var(--surface);
  border-radius: 20px;
  border: 1px solid var(--border);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.habit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.habit-card.archived {
  opacity: 0.6;
}

.card-main {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.icon-emoji {
  line-height: 1;
}

.card-info {
  min-width: 0;
}

.habit-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.freq-badge,
.cat-badge,
.archived-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
}

.freq-badge {
  background: var(--secondary-light);
  color: var(--text-secondary);
}

.cat-badge {
  background: var(--accent-light);
  color: var(--text-secondary);
}

.archived-badge {
  background: var(--warning-light);
  color: var(--text-secondary);
}

.description {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-muted);
  transition: background 0.12s ease, color 0.12s ease;
}

.icon-btn:hover {
  background: var(--surface-alt);
  color: var(--text);
}

.delete-btn:hover {
  background: var(--error-light);
  color: var(--error);
}

.edit-btn:hover {
  background: var(--primary-light);
  color: var(--primary-dark);
}
</style>
