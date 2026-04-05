import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { createTestUser, cleanDatabase, testPrisma } from './helpers.js'

const app = createApp()

beforeEach(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await cleanDatabase()
  await testPrisma.$disconnect()
})

describe('POST /api/habits', () => {
  it('creates a habit when authenticated with valid data', async () => {
    const { token } = await createTestUser()

    const res = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Morning Run', category: 'Health', icon: '🏃' })

    expect(res.status).toBe(201)
    expect(res.body.data.name).toBe('Morning Run')
    expect(res.body.data.category).toBe('Health')
  })

  it('returns 400 when name is missing', async () => {
    const { token } = await createTestUser()

    const res = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ category: 'Health' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/habits')
      .send({ name: 'Morning Run' })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/habits', () => {
  it('returns list of habits for the authenticated user', async () => {
    const { token, userId } = await createTestUser('user1@test.com')
    await testPrisma.habit.create({ data: { userId, name: 'Habit A' } })
    await testPrisma.habit.create({ data: { userId, name: 'Habit B' } })

    const res = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.data.map((h: { name: string }) => h.name)).toContain('Habit A')
  })

  it('does not return other users habits', async () => {
    const { token } = await createTestUser('user1@test.com')
    const { userId: otherId } = await createTestUser('user2@test.com')
    await testPrisma.habit.create({ data: { userId: otherId, name: 'Other Habit' } })

    const res = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(0)
  })

  it('filters by category when ?category= is provided', async () => {
    const { token, userId } = await createTestUser()
    await testPrisma.habit.create({ data: { userId, name: 'Morning Run', category: 'Health' } })
    await testPrisma.habit.create({ data: { userId, name: 'Read Book', category: 'Learning' } })

    const res = await request(app)
      .get('/api/habits?category=Health')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].name).toBe('Morning Run')
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/habits')
    expect(res.status).toBe(401)
  })
})

describe('PUT /api/habits/:id', () => {
  it('updates a habit the user owns', async () => {
    const { token, userId } = await createTestUser()
    const habit = await testPrisma.habit.create({ data: { userId, name: 'Old Name' } })

    const res = await request(app)
      .put(`/api/habits/${habit.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name', color: '#FF0000' })

    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe('New Name')
    expect(res.body.data.color).toBe('#FF0000')
  })

  it('returns 403 when updating another users habit', async () => {
    const { token } = await createTestUser('user1@test.com')
    const { userId: otherId } = await createTestUser('user2@test.com')
    const habit = await testPrisma.habit.create({ data: { userId: otherId, name: 'Other Habit' } })

    const res = await request(app)
      .put(`/api/habits/${habit.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Hacked' })

    expect(res.status).toBe(403)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).put('/api/habits/some-id').send({ name: 'x' })
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/habits/:id/archive', () => {
  it('toggles isArchived status for owned habit', async () => {
    const { token, userId } = await createTestUser()
    const habit = await testPrisma.habit.create({
      data: { userId, name: 'Habit', isArchived: false },
    })

    const res = await request(app)
      .patch(`/api/habits/${habit.id}/archive`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.isArchived).toBe(true)
  })

  it('returns 403 when archiving another users habit', async () => {
    const { token } = await createTestUser('user1@test.com')
    const { userId: otherId } = await createTestUser('user2@test.com')
    const habit = await testPrisma.habit.create({ data: { userId: otherId, name: 'Other' } })

    const res = await request(app)
      .patch(`/api/habits/${habit.id}/archive`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).patch('/api/habits/some-id/archive')
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/habits/reorder', () => {
  it('updates positions for habits the user owns', async () => {
    const { token, userId } = await createTestUser()
    const h1 = await testPrisma.habit.create({ data: { userId, name: 'H1', position: 0 } })
    const h2 = await testPrisma.habit.create({ data: { userId, name: 'H2', position: 1 } })

    const res = await request(app)
      .patch('/api/habits/reorder')
      .set('Authorization', `Bearer ${token}`)
      .send({ habits: [{ id: h1.id, position: 1 }, { id: h2.id, position: 0 }] })

    expect(res.status).toBe(200)

    const updated1 = await testPrisma.habit.findUnique({ where: { id: h1.id } })
    const updated2 = await testPrisma.habit.findUnique({ where: { id: h2.id } })
    expect(updated1?.position).toBe(1)
    expect(updated2?.position).toBe(0)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).patch('/api/habits/reorder').send({ habits: [] })
    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/habits/:id', () => {
  it('deletes a habit the user owns', async () => {
    const { token, userId } = await createTestUser()
    const habit = await testPrisma.habit.create({ data: { userId, name: 'To Delete' } })

    const res = await request(app)
      .delete(`/api/habits/${habit.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)

    const deleted = await testPrisma.habit.findUnique({ where: { id: habit.id } })
    expect(deleted).toBeNull()
  })

  it('returns 403 when deleting another users habit', async () => {
    const { token } = await createTestUser('user1@test.com')
    const { userId: otherId } = await createTestUser('user2@test.com')
    const habit = await testPrisma.habit.create({ data: { userId: otherId, name: 'Other' } })

    const res = await request(app)
      .delete(`/api/habits/${habit.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })

  it('returns 401 without auth token', async () => {
    const res = await request(app).delete('/api/habits/some-id')
    expect(res.status).toBe(401)
  })
})
