import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { createTestUser, cleanDatabase } from './helpers.js'
import { prisma } from '../lib/prisma.js'

const app = createApp()

beforeEach(async () => {
  await cleanDatabase()
})

describe('POST /api/habits', () => {
  it('creates a habit when authenticated with valid data', async () => {
    const { token } = await createTestUser()
    const res = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Meditation', icon: '🧘', color: '#7DD3B4', category: 'Health' })

    expect(res.status).toBe(201)
    expect(res.body.data.name).toBe('Meditation')
    expect(res.body.data.icon).toBe('🧘')
    expect(res.body.data.category).toBe('Health')
  })

  it('returns 400 when name is missing', async () => {
    const { token } = await createTestUser()
    const res = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ icon: '🧘' })

    expect(res.status).toBe(400)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/habits').send({ name: 'Test' })
    expect(res.status).toBe(401)
  })
})

describe('GET /api/habits', () => {
  it('returns list of habits for the authenticated user', async () => {
    const { userId, token } = await createTestUser()
    await prisma.habit.create({ data: { userId, name: 'Habit A', position: 0 } })
    await prisma.habit.create({ data: { userId, name: 'Habit B', position: 1 } })

    const res = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
  })

  it('does not return other users habits', async () => {
    const user1 = await createTestUser('user1@test.com')
    const user2 = await createTestUser('user2@test.com')
    await prisma.habit.create({ data: { userId: user1.userId, name: 'User1 Habit', position: 0 } })
    await prisma.habit.create({ data: { userId: user2.userId, name: 'User2 Habit', position: 0 } })

    const res = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${user1.token}`)

    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].name).toBe('User1 Habit')
  })

  it('filters by category when ?category= is provided', async () => {
    const { userId, token } = await createTestUser()
    await prisma.habit.create({ data: { userId, name: 'Run', category: 'Fitness', position: 0 } })
    await prisma.habit.create({ data: { userId, name: 'Read', category: 'Learning', position: 1 } })

    const res = await request(app)
      .get('/api/habits?category=Fitness')
      .set('Authorization', `Bearer ${token}`)

    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].name).toBe('Run')
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/habits')
    expect(res.status).toBe(401)
  })
})

describe('PUT /api/habits/:id', () => {
  it('updates a habit the user owns', async () => {
    const { userId, token } = await createTestUser()
    const habit = await prisma.habit.create({ data: { userId, name: 'Old Name', position: 0 } })

    const res = await request(app)
      .put(`/api/habits/${habit.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name' })

    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe('New Name')
  })

  it('returns 403 when updating another users habit', async () => {
    const user1 = await createTestUser('owner@test.com')
    const user2 = await createTestUser('other@test.com')
    const habit = await prisma.habit.create({ data: { userId: user1.userId, name: 'Private', position: 0 } })

    const res = await request(app)
      .put(`/api/habits/${habit.id}`)
      .set('Authorization', `Bearer ${user2.token}`)
      .send({ name: 'Hacked' })

    expect(res.status).toBe(403)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).put('/api/habits/fake-id').send({ name: 'Test' })
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/habits/:id/archive', () => {
  it('toggles isArchived false to true', async () => {
    const { userId, token } = await createTestUser()
    const habit = await prisma.habit.create({ data: { userId, name: 'Test', position: 0 } })

    const res = await request(app)
      .patch(`/api/habits/${habit.id}/archive`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.isArchived).toBe(true)
  })

  it('toggles isArchived true to false', async () => {
    const { userId, token } = await createTestUser()
    const habit = await prisma.habit.create({ data: { userId, name: 'Test', position: 0, isArchived: true } })

    const res = await request(app)
      .patch(`/api/habits/${habit.id}/archive`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.isArchived).toBe(false)
  })

  it('returns 403 when archiving another users habit', async () => {
    const user1 = await createTestUser('owner@test.com')
    const user2 = await createTestUser('other@test.com')
    const habit = await prisma.habit.create({ data: { userId: user1.userId, name: 'Private', position: 0 } })

    const res = await request(app)
      .patch(`/api/habits/${habit.id}/archive`)
      .set('Authorization', `Bearer ${user2.token}`)

    expect(res.status).toBe(403)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).patch('/api/habits/fake-id/archive')
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/habits/reorder', () => {
  it('updates positions for habits the user owns', async () => {
    const { userId, token } = await createTestUser()
    const h1 = await prisma.habit.create({ data: { userId, name: 'A', position: 0 } })
    const h2 = await prisma.habit.create({ data: { userId, name: 'B', position: 1 } })

    const res = await request(app)
      .patch('/api/habits/reorder')
      .set('Authorization', `Bearer ${token}`)
      .send({ habits: [{ id: h1.id, position: 1 }, { id: h2.id, position: 0 }] })

    expect(res.status).toBe(200)
    const updated = await prisma.habit.findMany({ where: { userId }, orderBy: { position: 'asc' } })
    expect(updated[0].name).toBe('B')
    expect(updated[1].name).toBe('A')
  })

  it('returns 403 when reordering another users habits', async () => {
    const user1 = await createTestUser('owner@test.com')
    const user2 = await createTestUser('other@test.com')
    const habit = await prisma.habit.create({ data: { userId: user1.userId, name: 'Private', position: 0 } })

    const res = await request(app)
      .patch('/api/habits/reorder')
      .set('Authorization', `Bearer ${user2.token}`)
      .send({ habits: [{ id: habit.id, position: 5 }] })

    expect(res.status).toBe(403)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).patch('/api/habits/reorder').send({ habits: [] })
    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/habits/:id', () => {
  it('deletes a habit the user owns', async () => {
    const { userId, token } = await createTestUser()
    const habit = await prisma.habit.create({ data: { userId, name: 'ToDelete', position: 0 } })

    const res = await request(app)
      .delete(`/api/habits/${habit.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)
    const found = await prisma.habit.findUnique({ where: { id: habit.id } })
    expect(found).toBeNull()
  })

  it('returns 403 when deleting another users habit', async () => {
    const user1 = await createTestUser('owner@test.com')
    const user2 = await createTestUser('other@test.com')
    const habit = await prisma.habit.create({ data: { userId: user1.userId, name: 'Private', position: 0 } })

    const res = await request(app)
      .delete(`/api/habits/${habit.id}`)
      .set('Authorization', `Bearer ${user2.token}`)

    expect(res.status).toBe(403)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).delete('/api/habits/fake-id')
    expect(res.status).toBe(401)
  })
})
