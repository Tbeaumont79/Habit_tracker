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
      json: async () => ({ data: newLog }),
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

    const untoggledLog: HabitLog = {
      ...mockLogs[0],
      completed: false,
    }

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: untoggledLog }),
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
      json: async () => ({ data: newLog }),
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
})
