import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types'

const API_BASE = 'http://localhost:3001/api/auth'
const TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => token.value !== null && user.value !== null)

  async function register(email: string, password: string, name: string): Promise<void> {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ?? data.message ?? 'Registration failed')
    }

    const data = await res.json()
    token.value = data.data?.token ?? data.token
    user.value = data.data?.user ?? data.user
    if (token.value) {
      localStorage.setItem(TOKEN_KEY, token.value)
    }
  }

  async function login(email: string, password: string): Promise<void> {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ?? data.message ?? 'Invalid credentials')
    }

    const data = await res.json()
    token.value = data.data?.token ?? data.token
    user.value = data.data?.user ?? data.user
    if (token.value) {
      localStorage.setItem(TOKEN_KEY, token.value)
    }
  }

  function logout(): void {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  async function fetchMe(): Promise<void> {
    if (!token.value) return

    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })

    if (!res.ok) {
      logout()
      return
    }

    const data = await res.json()
    user.value = data.data?.user ?? data.user ?? data
  }

  // On store init, load user from token if present
  if (token.value) {
    fetchMe().catch(() => logout())
  }

  return { token, user, isAuthenticated, register, login, logout, fetchMe }
})
