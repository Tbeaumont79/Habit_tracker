<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Habit, CreateHabitData } from '@/types/habit'

const props = defineProps<{
  habit?: Habit
}>()

const emit = defineEmits<{
  (e: 'submit', data: CreateHabitData): void
  (e: 'close'): void
}>()

const name = ref(props.habit?.name ?? '')
const description = ref(props.habit?.description ?? '')
const icon = ref(props.habit?.icon ?? '✨')
const color = ref(props.habit?.color ?? '#FF6B9D')
const frequency = ref<'DAILY' | 'WEEKLY' | 'CUSTOM'>(props.habit?.frequency ?? 'DAILY')
const category = ref(props.habit?.category ?? '')
const nameError = ref('')

watch(
  () => props.habit,
  (h) => {
    name.value = h?.name ?? ''
    description.value = h?.description ?? ''
    icon.value = h?.icon ?? '✨'
    color.value = h?.color ?? '#FF6B9D'
    frequency.value = h?.frequency ?? 'DAILY'
    category.value = h?.category ?? ''
    nameError.value = ''
  },
)

function validate(): boolean {
  if (!name.value.trim()) {
    nameError.value = 'Name is required'
    return false
  }
  nameError.value = ''
  return true
}

function handleSubmit() {
  if (!validate()) return
  const data: CreateHabitData = {
    name: name.value.trim(),
    description: description.value.trim() || null,
    icon: icon.value.trim() || '✨',
    color: color.value,
    frequency: frequency.value,
    category: category.value.trim() || null,
  }
  emit('submit', data)
}

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <div class="modal-backdrop" @click="handleBackdropClick">
    <div class="modal-card" role="dialog" aria-modal="true" :aria-label="props.habit ? 'Edit habit' : 'Add habit'">
      <div class="modal-header">
        <h2 class="modal-title">{{ props.habit ? 'Edit Habit' : 'Add Habit' }}</h2>
        <button class="close-btn" aria-label="Close" @click="emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <form class="modal-body" novalidate @submit.prevent="handleSubmit">
        <!-- Name -->
        <div class="field">
          <label class="label" for="habit-name">Name <span class="required">*</span></label>
          <input
            id="habit-name"
            v-model="name"
            class="input"
            :class="{ error: !!nameError }"
            type="text"
            placeholder="e.g. Morning run"
            autocomplete="off"
          />
          <span v-if="nameError" class="field-error">{{ nameError }}</span>
        </div>

        <!-- Description -->
        <div class="field">
          <label class="label" for="habit-desc">Description</label>
          <textarea
            id="habit-desc"
            v-model="description"
            class="input textarea"
            placeholder="Optional description"
            rows="2"
          />
        </div>

        <!-- Icon & Color row -->
        <div class="field-row">
          <div class="field">
            <label class="label" for="habit-icon">Icon (emoji)</label>
            <input
              id="habit-icon"
              v-model="icon"
              class="input"
              type="text"
              placeholder="✨"
              maxlength="4"
            />
          </div>
          <div class="field">
            <label class="label" for="habit-color">Color</label>
            <div class="color-field">
              <input
                id="habit-color"
                v-model="color"
                class="color-input"
                type="color"
              />
              <span class="color-value">{{ color }}</span>
            </div>
          </div>
        </div>

        <!-- Frequency -->
        <div class="field">
          <label class="label" for="habit-freq">Frequency</label>
          <select id="habit-freq" v-model="frequency" class="input select">
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

        <!-- Category -->
        <div class="field">
          <label class="label" for="habit-cat">Category</label>
          <input
            id="habit-cat"
            v-model="category"
            class="input"
            type="text"
            placeholder="e.g. Health, Learning…"
          />
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-ghost" @click="emit('close')">Cancel</button>
          <button type="submit" class="btn btn-primary">
            {{ props.habit ? 'Save Changes' : 'Add Habit' }}
          </button>
        </div>
      </form>
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
  z-index: 50;
  padding: 16px;
}

.modal-card {
  background: var(--surface);
  border-radius: 24px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: background 0.12s;
}

.close-btn:hover {
  background: var(--surface-alt);
  color: var(--text);
}

.modal-body {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.field-row {
  display: flex;
  gap: 12px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.required {
  color: var(--primary);
}

.input {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 14px;
  color: var(--text);
  background: var(--surface);
  outline: none;
  transition: border-color 0.12s;
  font-family: inherit;
  width: 100%;
}

.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.12);
}

.input.error {
  border-color: var(--error);
}

.textarea {
  resize: vertical;
  min-height: 58px;
}

.select {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237B7192' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.color-field {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 6px 12px;
  cursor: pointer;
}

.color-input {
  width: 28px;
  height: 28px;
  border: none;
  padding: 0;
  border-radius: 6px;
  cursor: pointer;
  background: none;
}

.color-value {
  font-size: 13px;
  color: var(--text-muted);
  font-family: monospace;
}

.field-error {
  font-size: 12px;
  color: var(--error);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
}

.btn {
  padding: 9px 20px;
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

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
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
