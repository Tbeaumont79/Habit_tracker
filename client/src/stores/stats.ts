import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Stats } from '@/types/stats'

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/stats`

function getToken(): string {
  return localStorage.getItem('token') ?? ''
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

export const useStatsStore = defineStore('stats', () => {
  const stats = ref<Stats | null>(null)
  const loading = ref(false)

  async function fetchStats(): Promise<void> {
    loading.value = true
    try {
      const res = await fetch(API_BASE, { headers: authHeaders() })
      if (!res.ok) {
        const json: unknown = await res.json().catch(() => ({}))
        const message =
          typeof json === 'object' && json !== null && 'error' in json
            ? String((json as Record<string, unknown>).error)
            : `HTTP error ${res.status}`
        throw new Error(message)
      }
      const json = (await res.json()) as { data: Stats }
      stats.value = json.data
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    fetchStats,
  }
})
