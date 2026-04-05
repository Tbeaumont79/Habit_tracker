import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { createTestUser, cleanDatabase } from './helpers.js'
import { prisma } from '../lib/prisma.js'

const app = createApp()

beforeEach(async () => {
  await cleanDatabase()
})

describe('POST /api/tracking/:id/toggle', () => {
  it('creates a log (toggles on) when no log exists for today', async () => {
    const { userId, token } = await createTestUser()
    const habit = await prisma.habit.create({ data: { userId, name: 'Run', position: 0 } })

    const res = await request(app)
      .post(`/api/tracking/${habit.id}/toggle`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.completed).toBe(true)
    expect(res.body.data.log).not.toBeNull()
    expect(res.body.data.log.habitId).toBe(habit.id)
  })

  it('deletes a log (toggles off) when a log already exists for today', async () => {
    const { userId, token } = await createTestUser()
    const habit = await prisma.habit.create({ data: { userId, name: 'Run', position: 0 } })

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    await prisma.habitLog.create({ data: { habitId: habit.id, date: today } })

    const res = await request(app)
      .post(`/api/tracking/${habit.id}/toggle`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.completed).toBe(false)
    expect(res.body.data.log).toBeNull()
  })

  it('toggles for a specific date when date param is provided', async () => {
    const { userId, token } = await createTestUser()
    const habit = await prisma.habit.create({ data: { userId, name: 'Read', position: 0 } })

    const res = await request(app)
      .post(`/api/tracking/${habit.id}/toggle`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2024-01-15' })

    expect(res.status).toBe(200)
    expect(res.body.data.completed).toBe(true)
    expect(res.body.data.log.habitId).toBe(habit.id)

    const log = await prisma.habitLog.findFirst({ where: { habitId: habit.id } })
    expect(log).not.toBeNull()
    expect(new Date(log!.date).toISOString()).toBe('2024-01-15T00:00:00.000Z')
  })

  it('returns 404 for non-existent habit', async () => {
    const { token } = await createTestUser()

    const res = await request(app)
      .post('/api/tracking/nonexistent-id/toggle')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  it('returns 403 for another users habit', async () => {
    const user1 = await createTestUser('owner@test.com')
    const user2 = await createTestUser('other@test.com')
    const habit = await prisma.habit.create({ data: { userId: user1.userId, name: 'Private', position: 0 } })

    const res = await request(app)
      .post(`/api/tracking/${habit.id}/toggle`)
      .set('Authorization', `Bearer ${user2.token}`)

    expect(res.status).toBe(403)
  })

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/tracking/some-id/toggle')
    expect(res.status).toBe(401)
  })
})

describe('GET /api/tracking/logs', () => {
  it('returns logs for a specific date', async () => {
    const { userId, token } = await createTestUser()
    const habit = await prisma.habit.create({ data: { userId, name: 'Meditate', position: 0 } })
    const date = new Date('2024-01-15T00:00:00.000Z')
    await prisma.habitLog.create({ data: { habitId: habit.id, date } })

    const res = await request(app)
      .get('/api/tracking/logs?date=2024-01-15')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].habitId).toBe(habit.id)
    expect(res.body.data[0].habit).toBeDefined()
  })

  it('returns logs for a date range', async () => {
    const { userId, token } = await createTestUser()
    const habit = await prisma.habit.create({ data: { userId, name: 'Meditate', position: 0 } })

    await prisma.habitLog.create({ data: { habitId: habit.id, date: new Date('2024-01-05T00:00:00.000Z') } })
    await prisma.habitLog.create({ data: { habitId: habit.id, date: new Date('2024-01-15T00:00:00.000Z') } })
    await prisma.habitLog.create({ data: { habitId: habit.id, date: new Date('2024-02-01T00:00:00.000Z') } })

    const res = await request(app)
      .get('/api/tracking/logs?from=2024-01-01&to=2024-01-31')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
  })

  it('returns 400 when no date params provided', async () => {
    const { token } = await createTestUser()

    const res = await request(app)
      .get('/api/tracking/logs')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/tracking/logs?date=2024-01-15')
    expect(res.status).toBe(401)
  })
})
