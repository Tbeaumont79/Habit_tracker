import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { HabitLog } from '@/types/habit'

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`

function getToken(): string {
  return localStorage.getItem('token') ?? ''
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
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

export const useTrackingStore = defineStore('tracking', () => {
  const todayLogs = ref<Map<string, HabitLog>>(new Map())
  const loading = ref(false)

  async function fetchTodayLogs(): Promise<void> {
    loading.value = true
    try {
      const date = todayDateString()
      const url = `${API_BASE}/tracking/logs?date=${date}`
      const res = await fetch(url, { headers: authHeaders() })
      const logs = await parseResponse<HabitLog[]>(res)
      const map = new Map<string, HabitLog>()
      for (const log of logs) {
        map.set(log.habitId, log)
      }
      todayLogs.value = map
    } finally {
      loading.value = false
    }
  }

  async function toggleHabit(habitId: string): Promise<void> {
    const url = `${API_BASE}/tracking/${habitId}/toggle`
    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
    })
    const log = await parseResponse<HabitLog>(res)
    if (log.completed) {
      todayLogs.value = new Map(todayLogs.value).set(log.habitId, log)
    } else {
      const updated = new Map(todayLogs.value)
      updated.delete(log.habitId)
      todayLogs.value = updated
    }
  }

  const isCompleted = computed(() => (habitId: string) => todayLogs.value.has(habitId))

  return {
    todayLogs,
    loading,
    fetchTodayLogs,
    toggleHabit,
    isCompleted,
  }
})
