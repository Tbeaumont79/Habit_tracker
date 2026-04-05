import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTrackingStore } from '@/stores/tracking'
import type { HabitLog } from '@/types/habit'

const mockLogs: HabitLog[] = [
  {
    id: 'log-1',
    habitId: 'habit-1',
    date: '2024-01-15',
    completed: true,
    note: null,
    createdAt: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 'log-2',
    habitId: 'habit-2',
    date: '2024-01-15',
    completed: true,
    note: 'Great session!',
    createdAt: '2024-01-15T09:00:00.000Z',
  },
]

describe('useTrackingStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('test-token')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with empty todayLogs map and loading false', () => {
    const store = useTrackingStore()
    expect(store.todayLogs.size).toBe(0)
    expect(store.loading).toBe(false)
  })

  it('fetchTodayLogs populates todayLogs map keyed by habitId', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockLogs }),
    } as Response)

    const store = useTrackingStore()
    await store.fetchTodayLogs()

    expect(store.todayLogs.size).toBe(2)
    expect(store.todayLogs.get('habit-1')).toMatchObject({ id: 'log-1', habitId: 'habit-1' })
    expect(store.todayLogs.get('habit-2')).toMatchObject({ id: 'log-2', habitId: 'habit-2' })
  })

  it('fetchTodayLogs passes today date as query param', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response)

    const store = useTrackingStore()
    await store.fetchTodayLogs()

    const fetchMock = global.fetch as ReturnType<typeof vi.fn>
    const calledUrl = fetchMock.mock.calls[0][0] as string
    const today = new Date().toISOString().slice(0, 10)
    expect(calledUrl).toContain(`date=${today}`)
  })

  it('fetchTodayLogs sets loading to false after completion', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response)

    const store = useTrackingStore()
    const fetchPromise = store.fetchTodayLogs()
    expect(store.loading).toBe(true)
    await fetchPromise
    expect(store.loading).toBe(false)
  })

  it('isCompleted returns true for habits with a log in todayLogs', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockLogs }),
    } as Response)

    const store = useTrackingStore()
    await store.fetchTodayLogs()

    expect(store.isCompleted('habit-1')).toBe(true)
    expect(store.isCompleted('habit-2')).toBe(true)
    expect(store.isCompleted('habit-99')).toBe(false)
  })

  it('toggleHabit adds log to todayLogs when completed is true', async () => {
    const newLog: HabitLog = {
      id: 'log-3',
      habitId: 'habit-3',
      date: '2024-01-15',
      completed: true,
      note: null,
      createdAt: '2024-01-15T10:00:00.000Z',
    }

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { completed: true, log: newLog } }),
    } as Response)

    const store = useTrackingStore()
    expect(store.isCompleted('habit-3')).toBe(false)

    await store.toggleHabit('habit-3')

    expect(store.isCompleted('habit-3')).toBe(true)
    expect(store.todayLogs.get('habit-3')).toMatchObject({ id: 'log-3' })
  })

  it('toggleHabit removes log from todayLogs when completed is false (untoggle)', async () => {
    const store = useTrackingStore()
    // Pre-populate with a log
    store.todayLogs.set('habit-1', mockLogs[0])

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { completed: false, log: null } }),
    } as Response)

    expect(store.isCompleted('habit-1')).toBe(true)

    await store.toggleHabit('habit-1')

    expect(store.isCompleted('habit-1')).toBe(false)
  })

  it('toggleHabit calls POST /api/tracking/:id/toggle with auth header', async () => {
    const newLog: HabitLog = {
      id: 'log-4',
      habitId: 'habit-4',
      date: '2024-01-15',
      completed: true,
      note: null,
      createdAt: '2024-01-15T11:00:00.000Z',
    }

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { completed: true, log: newLog } }),
    } as Response)

    const store = useTrackingStore()
    await store.toggleHabit('habit-4')

    const fetchMock = global.fetch as ReturnType<typeof vi.fn>
    const [calledUrl, calledOptions] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(calledUrl).toContain('/api/tracking/habit-4/toggle')
    expect(calledOptions.method).toBe('POST')
    expect((calledOptions.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer test-token',
    )
  })

  it('toggleHabit applies optimistic update immediately before fetch resolves', async () => {
    let resolveFetch!: (value: unknown) => void
    const fetchPromise = new Promise((resolve) => { resolveFetch = resolve })

    global.fetch = vi.fn().mockReturnValueOnce(fetchPromise)

    const store = useTrackingStore()
    expect(store.isCompleted('habit-5')).toBe(false)

    const togglePromise = store.toggleHabit('habit-5')

    // Before fetch resolves, the optimistic update should already be applied
    expect(store.isCompleted('habit-5')).toBe(true)
    expect(store.todayLogs.get('habit-5')).toMatchObject({ id: 'temp', habitId: 'habit-5' })

    // Now resolve the fetch with real server data
    const realLog: HabitLog = {
      id: 'log-5',
      habitId: 'habit-5',
      date: '2024-01-15',
      completed: true,
      note: null,
      createdAt: '2024-01-15T12:00:00.000Z',
    }
    resolveFetch({ ok: true, json: async () => ({ data: { completed: true, log: realLog } }) })
    await togglePromise

    // After fetch, the real log replaces the optimistic one
    expect(store.isCompleted('habit-5')).toBe(true)
    expect(store.todayLogs.get('habit-5')).toMatchObject({ id: 'log-5' })
  })

  it('toggleHabit rolls back optimistic update on fetch error', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    } as Response)

    const store = useTrackingStore()
    expect(store.isCompleted('habit-6')).toBe(false)

    await store.toggleHabit('habit-6')

    // Should be rolled back to the original state (not completed)
    expect(store.isCompleted('habit-6')).toBe(false)
  })

  it('toggleHabit rolls back to previous log on error when habit was already completed', async () => {
    const store = useTrackingStore()
    store.todayLogs.set('habit-1', mockLogs[0])

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    } as Response)

    expect(store.isCompleted('habit-1')).toBe(true)

    await store.toggleHabit('habit-1')

    // Should be rolled back to completed (the previous state)
    expect(store.isCompleted('habit-1')).toBe(true)
    expect(store.todayLogs.get('habit-1')).toMatchObject({ id: 'log-1' })
  })
})
