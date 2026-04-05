import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStatsStore } from '@/stores/stats'
import type { Stats } from '@/types/stats'

const mockStats: Stats = {
  today: {
    completed: 5,
    total: 8,
    rate: 0.625,
  },
  streaks: {
    best: { habitId: 'h1', habitName: 'Morning Run', count: 25 },
    current: [
      { habitId: 'h1', habitName: 'Morning Run', count: 12 },
      { habitId: 'h2', habitName: 'Read', count: 5 },
    ],
  },
  thisMonth: {
    completions: 142,
    previousMonth: 120,
  },
  activeHabits: 8,
  categoryBreakdown: [
    { category: 'Health', count: 3, percentage: 0.375 },
    { category: 'Learning', count: 2, percentage: 0.25 },
  ],
  weeklyHeatmap: [
    { habitId: 'h1', habitName: 'Morning Run', days: [true, true, false, true, true, true, false] },
  ],
}

describe('useStatsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('test-token')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with null stats and loading false', () => {
    const store = useStatsStore()
    expect(store.stats).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('fetchStats populates the store with stats from the API', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockStats }),
    } as Response)

    const store = useStatsStore()
    await store.fetchStats()

    expect(store.stats).not.toBeNull()
    expect(store.stats!.today.completed).toBe(5)
    expect(store.stats!.today.total).toBe(8)
    expect(store.stats!.today.rate).toBe(0.625)
  })

  it('fetchStats sets loading to false after completion', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockStats }),
    } as Response)

    const store = useStatsStore()
    const fetchPromise = store.fetchStats()
    expect(store.loading).toBe(true)
    await fetchPromise
    expect(store.loading).toBe(false)
  })

  it('fetchStats sends Authorization header with Bearer token', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockStats }),
    } as Response)

    const store = useStatsStore()
    await store.fetchStats()

    const fetchMock = global.fetch as ReturnType<typeof vi.fn>
    const calledOptions = fetchMock.mock.calls[0][1] as RequestInit
    const headers = calledOptions.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer test-token')
  })

  it('fetchStats throws and sets loading false on API error', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    } as Response)

    const store = useStatsStore()
    await expect(store.fetchStats()).rejects.toThrow('Unauthorized')
    expect(store.loading).toBe(false)
  })

  it('fetched stats include streaks and categoryBreakdown', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockStats }),
    } as Response)

    const store = useStatsStore()
    await store.fetchStats()

    expect(store.stats!.streaks.best.count).toBe(25)
    expect(store.stats!.streaks.current).toHaveLength(2)
    expect(store.stats!.categoryBreakdown).toHaveLength(2)
    expect(store.stats!.categoryBreakdown[0].category).toBe('Health')
    expect(store.stats!.weeklyHeatmap).toHaveLength(1)
    expect(store.stats!.weeklyHeatmap[0].days).toHaveLength(7)
  })

  it('fetchStats sets activeHabits correctly', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockStats }),
    } as Response)

    const store = useStatsStore()
    await store.fetchStats()

    expect(store.stats!.activeHabits).toBe(8)
  })
})
