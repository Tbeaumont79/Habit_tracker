<script setup lang="ts">
import type { Habit } from '@/types/habit'

const props = defineProps<{
  habit: Habit
  checked: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

function handleToggle() {
  emit('toggle')
}
</script>

<template>
  <div class="habit-item" :class="{ 'habit-item--checked': props.checked }" @click="handleToggle">
    <!-- Icon circle -->
    <div
      class="habit-icon"
      :style="{ backgroundColor: props.habit.color + '33', borderColor: props.habit.color + '55' }"
    >
      <span class="habit-icon__emoji">{{ props.habit.icon }}</span>
    </div>

    <!-- Name + streak -->
    <div class="habit-info">
      <span class="habit-name" :class="{ 'habit-name--done': props.checked }">
        {{ props.habit.name }}
      </span>
      <span class="habit-streak">{{ props.habit.targetDays }} day streak goal</span>
    </div>

    <!-- Checkbox -->
    <div class="habit-checkbox" :class="{ 'habit-checkbox--checked': props.checked }">
      <svg
        v-if="props.checked"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M2 7L5.5 10.5L12 4"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.habit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  user-select: none;
}

.habit-item:hover {
  background: var(--surface-alt);
}

.habit-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  border: 1.5px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.habit-icon__emoji {
  font-size: 18px;
  line-height: 1;
}

.habit-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.habit-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  transition:
    opacity 0.2s ease,
    text-decoration 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.habit-name--done {
  text-decoration: line-through;
  opacity: 0.5;
}

.habit-streak {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--text-muted);
}

.habit-checkbox {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.habit-checkbox--checked {
  background: var(--accent);
  border-color: var(--accent);
  animation: bounce-check 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes bounce-check {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}
</style>
