import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { createTestUser, cleanDatabase } from './helpers.js'
import { prisma } from '../lib/prisma.js'

const app = createApp()

beforeEach(async () => {
  await cleanDatabase()
})

describe('GET /api/stats', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/stats')
    expect(res.status).toBe(401)
  })

  it('returns stats object with expected shape', async () => {
    const { token } = await createTestUser()

    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toBeDefined()

    const { data } = res.body

    // today
    expect(data.today).toBeDefined()
    expect(typeof data.today.completed).toBe('number')
    expect(typeof data.today.total).toBe('number')
    expect(typeof data.today.rate).toBe('number')

    // streaks
    expect(data.streaks).toBeDefined()
    expect(data.streaks.best).toBeDefined()
    expect(typeof data.streaks.best.count).toBe('number')
    expect(Array.isArray(data.streaks.current)).toBe(true)

    // thisMonth
    expect(data.thisMonth).toBeDefined()
    expect(typeof data.thisMonth.completions).toBe('number')
    expect(typeof data.thisMonth.previousMonth).toBe('number')

    // activeHabits
    expect(typeof data.activeHabits).toBe('number')

    // categoryBreakdown
    expect(Array.isArray(data.categoryBreakdown)).toBe(true)

    // weeklyHeatmap
    expect(Array.isArray(data.weeklyHeatmap)).toBe(true)
  })

  it('today stats reflect actual completed logs', async () => {
    const { userId, token } = await createTestUser()

    // Create 3 habits
    const h1 = await prisma.habit.create({ data: { userId, name: 'Run', position: 0 } })
    const h2 = await prisma.habit.create({ data: { userId, name: 'Read', position: 1 } })
    await prisma.habit.create({ data: { userId, name: 'Meditate', position: 2 } })

    // Log 2 of the 3 habits today
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    await prisma.habitLog.create({ data: { habitId: h1.id, date: today, completed: true } })
    await prisma.habitLog.create({ data: { habitId: h2.id, date: today, completed: true } })

    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.today.completed).toBe(2)
    expect(res.body.data.today.total).toBe(3)
    expect(res.body.data.today.rate).toBeCloseTo(2 / 3)
  })

  it('streaks reflect consecutive log data', async () => {
    const { userId, token } = await createTestUser()
    const habit = await prisma.habit.create({ data: { userId, name: 'Exercise', position: 0 } })

    // Create 5 consecutive days ending today
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today)
      d.setUTCDate(d.getUTCDate() - i)
      await prisma.habitLog.create({ data: { habitId: habit.id, date: d, completed: true } })
    }

    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    const { streaks } = res.body.data
    expect(streaks.best.count).toBe(5)
    expect(streaks.best.habitId).toBe(habit.id)
    expect(streaks.current.length).toBeGreaterThan(0)
    expect(streaks.current[0].count).toBe(5)
  })

  it('categoryBreakdown groups habits by category with correct percentages', async () => {
    const { userId, token } = await createTestUser()

    await prisma.habit.create({ data: { userId, name: 'Run', category: 'Health', position: 0 } })
    await prisma.habit.create({ data: { userId, name: 'Yoga', category: 'Health', position: 1 } })
    await prisma.habit.create({ data: { userId, name: 'Read', category: 'Learning', position: 2 } })
    await prisma.habit.create({ data: { userId, name: 'Code', category: 'Learning', position: 3 } })

    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    const { categoryBreakdown } = res.body.data
    expect(categoryBreakdown).toHaveLength(2)

    const health = categoryBreakdown.find((c: { category: string }) => c.category === 'Health')
    const learning = categoryBreakdown.find((c: { category: string }) => c.category === 'Learning')

    expect(health).toBeDefined()
    expect(health.count).toBe(2)
    expect(health.percentage).toBeCloseTo(0.5)

    expect(learning).toBeDefined()
    expect(learning.count).toBe(2)
    expect(learning.percentage).toBeCloseTo(0.5)
  })

  it('weeklyHeatmap contains an entry per active habit with 7 boolean days', async () => {
    const { userId, token } = await createTestUser()
    const h1 = await prisma.habit.create({ data: { userId, name: 'Run', position: 0 } })
    await prisma.habit.create({ data: { userId, name: 'Read', position: 1 } })

    // Log h1 for today
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    await prisma.habitLog.create({ data: { habitId: h1.id, date: today, completed: true } })

    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    const { weeklyHeatmap } = res.body.data
    expect(weeklyHeatmap).toHaveLength(2)

    const runEntry = weeklyHeatmap.find((e: { habitId: string }) => e.habitId === h1.id)
    expect(runEntry).toBeDefined()
    expect(runEntry.days).toHaveLength(7)
    // Today is last day (index 6)
    expect(runEntry.days[6]).toBe(true)
  })

  it('activeHabits excludes archived habits', async () => {
    const { userId, token } = await createTestUser()
    await prisma.habit.create({ data: { userId, name: 'Active', position: 0, isArchived: false } })
    await prisma.habit.create({ data: { userId, name: 'Archived', position: 1, isArchived: true } })

    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.activeHabits).toBe(1)
  })

  it('thisMonth counts logs in current and previous month', async () => {
    const { userId, token } = await createTestUser()
    const habit = await prisma.habit.create({ data: { userId, name: 'Run', position: 0 } })

    const now = new Date()
    // Two logs this month
    const thisMonth1 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const thisMonth2 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 2))
    // One log last month
    const prevMonth1 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 15))

    await prisma.habitLog.create({ data: { habitId: habit.id, date: thisMonth1, completed: true } })
    await prisma.habitLog.create({ data: { habitId: habit.id, date: thisMonth2, completed: true } })
    await prisma.habitLog.create({ data: { habitId: habit.id, date: prevMonth1, completed: true } })

    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.thisMonth.completions).toBe(2)
    expect(res.body.data.thisMonth.previousMonth).toBe(1)
  })
})
