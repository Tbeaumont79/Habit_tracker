<script setup lang="ts">
import type { Habit } from '@/types/habit'

const props = defineProps<{
  habit: Habit
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('cancel')
}
</script>

<template>
  <div class="modal-backdrop" @click="handleBackdropClick">
    <div class="confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
      <div class="confirm-icon">🗑️</div>
      <h3 id="confirm-title" class="confirm-title">Delete Habit</h3>
      <p class="confirm-message">
        Are you sure you want to delete <strong>{{ props.habit.name }}</strong>? This action cannot be undone.
      </p>
      <div class="confirm-actions">
        <button class="btn btn-ghost" @click="emit('cancel')">Cancel</button>
        <button class="btn btn-danger" @click="emit('confirm')">Delete</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
  padding: 16px;
}

.confirm-card {
  background: var(--surface);
  border-radius: 24px;
  width: 100%;
  max-width: 360px;
  padding: 32px 28px 28px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.confirm-icon {
  font-size: 40px;
  margin-bottom: 12px;
  line-height: 1;
}

.confirm-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 10px;
}

.confirm-message {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn {
  padding: 9px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.12s, transform 0.1s;
}

.btn:active {
  transform: scale(0.97);
}

.btn-danger {
  background: var(--error);
  color: white;
}

.btn-danger:hover {
  background: #c02222;
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-ghost:hover {
  background: var(--surface-alt);
}
</style>
