import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../stores/auth'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorageMock.clear()
    mockFetch.mockReset()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('initialises with null token and user', () => {
    const store = useAuthStore()
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
  })

  it('isAuthenticated is false when token and user are null', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
  })

  describe('login', () => {
    it('sets token and user on successful login', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }
      const mockToken = 'mock-jwt-token'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { token: mockToken, user: mockUser } }),
      })

      const store = useAuthStore()
      await store.login('test@example.com', 'password123')

      expect(store.token).toBe(mockToken)
      expect(store.user).toEqual(mockUser)
      expect(localStorageMock.getItem('auth_token')).toBe(mockToken)
    })

    it('isAuthenticated is true after successful login', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { token: 'some-token', user: mockUser } }),
      })

      const store = useAuthStore()
      await store.login('test@example.com', 'password123')

      expect(store.isAuthenticated).toBe(true)
    })

    it('throws an error on failed login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      })

      const store = useAuthStore()
      await expect(store.login('wrong@example.com', 'wrongpass')).rejects.toThrow(
        'Invalid credentials',
      )

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
    })

    it('persists token to localStorage on login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            token: 'persisted-token',
            user: { id: '1', email: 'a@b.com', name: 'A' },
          },
        }),
      })

      const store = useAuthStore()
      await store.login('a@b.com', 'password123')

      expect(localStorageMock.getItem('auth_token')).toBe('persisted-token')
    })
  })

  describe('register', () => {
    it('sets token and user on successful registration', async () => {
      const mockUser = { id: '2', email: 'new@example.com', name: 'New User' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { token: 'reg-token', user: mockUser } }),
      })

      const store = useAuthStore()
      await store.register('new@example.com', 'password123', 'New User')

      expect(store.token).toBe('reg-token')
      expect(store.user).toEqual(mockUser)
    })

    it('throws an error on failed registration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
      })

      const store = useAuthStore()
      await expect(store.register('exists@example.com', 'pass123', 'Name')).rejects.toThrow(
        'Email already exists',
      )
    })
  })

  describe('logout', () => {
    it('clears token and user on logout', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { token: 'some-token', user: mockUser } }),
      })

      const store = useAuthStore()
      await store.login('test@example.com', 'password123')

      expect(store.token).toBe('some-token')

      store.logout()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('removes token from localStorage on logout', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { token: 'stored-token', user: { id: '1', email: 'a@b.com', name: 'A' } },
        }),
      })

      const store = useAuthStore()
      await store.login('a@b.com', 'password123')

      expect(localStorageMock.getItem('auth_token')).toBe('stored-token')

      store.logout()

      expect(localStorageMock.getItem('auth_token')).toBeNull()
    })
  })

  describe('fetchMe', () => {
    it('sets user from API response', async () => {
      localStorageMock.setItem('auth_token', 'existing-token')
      const mockUser = { id: '1', email: 'me@example.com', name: 'Me' }

      // First call is from store init (fetchMe on mount)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { user: mockUser } }),
      })

      const store = useAuthStore()

      // Wait for the init fetchMe
      await vi.waitUntil(() => store.user !== null, { timeout: 1000 })

      expect(store.user).toEqual(mockUser)
    })

    it('calls logout if fetchMe returns non-ok', async () => {
      localStorageMock.setItem('auth_token', 'expired-token')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      })

      const store = useAuthStore()

      await vi.waitUntil(() => store.token === null, { timeout: 1000 })

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
    })
  })
})
