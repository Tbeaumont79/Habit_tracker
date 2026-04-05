<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHabitsStore } from '@/stores/habits'
import HabitCard from '@/components/habits/HabitCard.vue'
import HabitForm from '@/components/habits/HabitForm.vue'
import HabitDeleteConfirm from '@/components/habits/HabitDeleteConfirm.vue'
import type { Habit, CreateHabitData } from '@/types/habit'

const store = useHabitsStore()

// Modal state
const showForm = ref(false)
const editingHabit = ref<Habit | undefined>(undefined)
const deletingHabit = ref<Habit | undefined>(undefined)

// Category filter
const activeCategory = ref<string>('')

// Error state
const errorMessage = ref<string>('')

function clearError() {
  errorMessage.value = ''
}

function handleError(err: unknown) {
  errorMessage.value = err instanceof Error ? err.message : 'An unexpected error occurred.'
}

const categories = computed<string[]>(() => {
  const cats = store.habits
    .map((h) => h.category)
    .filter((c): c is string => !!c)
  return [...new Set(cats)]
})

const filteredHabits = computed<Habit[]>(() => {
  if (!activeCategory.value) return store.habits
  return store.habits.filter((h) => h.category === activeCategory.value)
})

onMounted(async () => {
  try {
    await store.fetchHabits()
  } catch (err) {
    handleError(err)
  }
})

function openCreate() {
  editingHabit.value = undefined
  showForm.value = true
}

function openEdit(habit: Habit) {
  editingHabit.value = habit
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingHabit.value = undefined
}

async function handleFormSubmit(data: CreateHabitData) {
  clearError()
  try {
    if (editingHabit.value) {
      await store.updateHabit(editingHabit.value.id, data)
    } else {
      await store.createHabit(data)
    }
    closeForm()
  } catch (err) {
    handleError(err)
  }
}

function requestDelete(habit: Habit) {
  deletingHabit.value = habit
}

async function confirmDelete() {
  if (!deletingHabit.value) return
  clearError()
  try {
    await store.deleteHabit(deletingHabit.value.id)
    deletingHabit.value = undefined
  } catch (err) {
    handleError(err)
    deletingHabit.value = undefined
  }
}

function cancelDelete() {
  deletingHabit.value = undefined
}

async function handleArchive(habit: Habit) {
  clearError()
  try {
    await store.archiveHabit(habit.id)
  } catch (err) {
    handleError(err)
  }
}
</script>

<template>
  <div class="habits-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">My Habits</h1>
        <p class="page-subtitle">Build consistency, one day at a time.</p>
      </div>
      <button class="btn btn-primary add-btn" @click="openCreate">
        <span class="add-icon">+</span> Add Habit
      </button>
    </div>

    <!-- Error banner -->
    <div v-if="errorMessage" class="error-banner" role="alert">
      <span>{{ errorMessage }}</span>
      <button class="error-dismiss" aria-label="Dismiss error" @click="clearError">✕</button>
    </div>

    <!-- Category filter -->
    <div v-if="categories.length > 0" class="category-filters">
      <button
        class="filter-pill"
        :class="{ active: activeCategory === '' }"
        @click="activeCategory = ''"
      >
        All
      </button>
      <button
        v-for="cat in categories"
        :key="cat"
        class="filter-pill"
        :class="{ active: activeCategory === cat }"
        @click="activeCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && store.habits.length === 0" class="loading-state">
      <div class="spinner" />
      <p>Loading habits…</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!store.loading && filteredHabits.length === 0" class="empty-state">
      <div class="empty-emoji">🌱</div>
      <h2 class="empty-title">No habits yet</h2>
      <p class="empty-message">No habits yet, create your first one!</p>
      <button class="btn btn-primary" @click="openCreate">Add your first habit</button>
    </div>

    <!-- Habits list -->
    <div v-else class="habits-list">
      <HabitCard
        v-for="habit in filteredHabits"
        :key="habit.id"
        :habit="habit"
        @edit="openEdit"
        @archive="handleArchive"
        @delete="requestDelete"
      />
    </div>

    <!-- Habit Form Modal -->
    <HabitForm
      v-if="showForm"
      :habit="editingHabit"
      @submit="handleFormSubmit"
      @close="closeForm"
    />

    <!-- Delete Confirmation Modal -->
    <HabitDeleteConfirm
      v-if="deletingHabit"
      :habit="deletingHabit"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.habits-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  line-height: 1.2;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.add-icon {
  font-size: 18px;
  line-height: 1;
  font-weight: 400;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.filter-pill {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
  font-family: inherit;
}

.filter-pill:hover {
  background: var(--surface-alt);
  border-color: var(--primary-light);
  color: var(--primary-dark);
}

.filter-pill.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--text-muted);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 20px;
  text-align: center;
}

.empty-emoji {
  font-size: 56px;
  line-height: 1;
  margin-bottom: 4px;
}

.empty-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.empty-message {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.btn {
  padding: 10px 22px;
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

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--error-light, #fef2f2);
  color: var(--error, #dc2626);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  border: 1px solid var(--error, #dc2626);
}

.error-dismiss {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font-size: 14px;
  padding: 0 4px;
  line-height: 1;
  flex-shrink: 0;
}
</style>
