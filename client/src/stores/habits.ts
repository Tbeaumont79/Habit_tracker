import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Habit, CreateHabitData, UpdateHabitData } from '@/types/habit'

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/habits`

function getToken(): string {
  return localStorage.getItem('token') ?? ''
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const json: unknown = await res.json()
  if (!res.ok) {
    const message =
      typeof json === 'object' && json !== null && 'message' in json
        ? String((json as Record<string, unknown>).message)
        : `HTTP error ${res.status}`
    throw new Error(message)
  }
  const envelope = json as { data?: T }
  return (envelope.data ?? json) as T
}

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref<Habit[]>([])
  const loading = ref(false)

  async function fetchHabits(category?: string): Promise<void> {
    loading.value = true
    try {
      const url = new URL(API_BASE)
      if (category) url.searchParams.set('category', category)
      const res = await fetch(url.toString(), { headers: authHeaders() })
      habits.value = await parseResponse<Habit[]>(res)
    } finally {
      loading.value = false
    }
  }

  async function createHabit(data: CreateHabitData): Promise<Habit> {
    loading.value = true
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const created = await parseResponse<Habit>(res)
      habits.value.push(created)
      return created
    } finally {
      loading.value = false
    }
  }

  async function updateHabit(id: string, data: UpdateHabitData): Promise<Habit> {
    loading.value = true
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const updated = await parseResponse<Habit>(res)
      const idx = habits.value.findIndex((h) => h.id === id)
      if (idx !== -1) habits.value[idx] = updated
      return updated
    } finally {
      loading.value = false
    }
  }

  async function deleteHabit(id: string): Promise<void> {
    loading.value = true
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) {
        const json: unknown = await res.json().catch(() => ({}))
        const message =
          typeof json === 'object' && json !== null && 'message' in json
            ? String((json as Record<string, unknown>).message)
            : `HTTP error ${res.status}`
        throw new Error(message)
      }
      habits.value = habits.value.filter((h) => h.id !== id)
    } finally {
      loading.value = false
    }
  }

  async function archiveHabit(id: string): Promise<Habit> {
    loading.value = true
    try {
      const res = await fetch(`${API_BASE}/${id}/archive`, {
        method: 'PATCH',
        headers: authHeaders(),
      })
      const updated = await parseResponse<Habit>(res)
      const idx = habits.value.findIndex((h) => h.id === id)
      if (idx !== -1) habits.value[idx] = updated
      return updated
    } finally {
      loading.value = false
    }
  }

  async function reorderHabits(reordered: Habit[]): Promise<void> {
    habits.value = reordered
    const res = await fetch(`${API_BASE}/reorder`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({
        habits: reordered.map((h, idx) => ({ id: h.id, position: idx })),
      }),
    })
    if (!res.ok) {
      // Best-effort: refetch on failure to restore correct order
      await fetchHabits()
    }
  }

  return {
    habits,
    loading,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    reorderHabits,
  }
})
