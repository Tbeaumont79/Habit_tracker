import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHabitsStore } from '@/stores/habits'
import type { Habit } from '@/types/habit'

const mockHabits: Habit[] = [
  {
    id: '1',
    name: 'Morning Run',
    description: null,
    icon: '🏃',
    color: '#FF6B9D',
    frequency: 'DAILY',
    targetDays: 7,
    category: 'Health',
    position: 0,
    isArchived: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Read 30 min',
    description: 'Read every day',
    icon: '📚',
    color: '#B8A9E8',
    frequency: 'DAILY',
    targetDays: 7,
    category: 'Learning',
    position: 1,
    isArchived: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
]

describe('useHabitsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Mock localStorage.getItem for token
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('test-token')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with empty habits and loading false', () => {
    const store = useHabitsStore()
    expect(store.habits).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('fetchHabits populates the store with habits from the API', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockHabits }),
    } as Response)

    const store = useHabitsStore()
    await store.fetchHabits()

    expect(store.habits).toHaveLength(2)
    expect(store.habits[0].name).toBe('Morning Run')
    expect(store.habits[1].name).toBe('Read 30 min')
  })

  it('fetchHabits passes category query param when provided', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [mockHabits[0]] }),
    } as Response)

    const store = useHabitsStore()
    await store.fetchHabits('Health')

    const fetchMock = global.fetch as ReturnType<typeof vi.fn>
    const calledUrl = fetchMock.mock.calls[0][0] as string
    expect(calledUrl).toContain('category=Health')
    expect(store.habits).toHaveLength(1)
  })

  it('fetchHabits sets loading to false after completion', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockHabits }),
    } as Response)

    const store = useHabitsStore()
    const fetchPromise = store.fetchHabits()
    expect(store.loading).toBe(true)
    await fetchPromise
    expect(store.loading).toBe(false)
  })

  it('createHabit adds a new habit to the store', async () => {
    const newHabit: Habit = {
      ...mockHabits[0],
      id: '3',
      name: 'Meditate',
    }
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: newHabit }),
    } as Response)

    const store = useHabitsStore()
    const created = await store.createHabit({ name: 'Meditate', color: '#FF6B9D', frequency: 'DAILY' })

    expect(store.habits).toHaveLength(1)
    expect(store.habits[0].name).toBe('Meditate')
    expect(created.id).toBe('3')
  })

  it('deleteHabit removes the habit from the store', async () => {
    // Pre-populate
    const store = useHabitsStore()
    store.habits.push(...mockHabits)

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    await store.deleteHabit('1')
    expect(store.habits).toHaveLength(1)
    expect(store.habits[0].id).toBe('2')
  })

  it('archiveHabit updates the habit in the store', async () => {
    const archived: Habit = { ...mockHabits[0], isArchived: true }
    const store = useHabitsStore()
    store.habits.push(mockHabits[0])

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: archived }),
    } as Response)

    await store.archiveHabit('1')
    expect(store.habits[0].isArchived).toBe(true)
  })
})
