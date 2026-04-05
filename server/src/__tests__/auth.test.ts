import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { prisma } from '../lib/prisma.js'

const app = createApp()

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  await prisma.habitLog.deleteMany()
  await prisma.habit.deleteMany()
  await prisma.user.deleteMany()
})

describe('POST /api/auth/register', () => {
  it('returns JWT and user without password on success', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'alice@example.com',
      password: 'secret123',
      name: 'Alice',
    })

    expect(res.status).toBe(201)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.email).toBe('alice@example.com')
    expect(res.body.data.user.name).toBe('Alice')
    expect(res.body.data.user.password).toBeUndefined()
  })

  it('returns 409 on duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'alice@example.com',
      password: 'secret123',
      name: 'Alice',
    })

    const res = await request(app).post('/api/auth/register').send({
      email: 'alice@example.com',
      password: 'different123',
      name: 'Alice2',
    })

    expect(res.status).toBe(409)
    expect(res.body.error).toBeDefined()
  })

  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'alice@example.com',
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('returns 400 on invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      password: 'secret123',
      name: 'Alice',
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('returns 400 when password is shorter than 6 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'alice@example.com',
      password: 'abc',
      name: 'Alice',
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      email: 'alice@example.com',
      password: 'secret123',
      name: 'Alice',
    })
  })

  it('returns JWT and user on success', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'secret123',
    })

    expect(res.status).toBe(200)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.email).toBe('alice@example.com')
    expect(res.body.data.user.password).toBeUndefined()
  })

  it('returns 401 when password is wrong', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'wrongpassword',
    })

    expect(res.status).toBe(401)
    expect(res.body.error).toBeDefined()
  })

  it('returns 401 when email does not exist', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'unknown@example.com',
      password: 'secret123',
    })

    expect(res.status).toBe(401)
    expect(res.body.error).toBeDefined()
  })
})

describe('GET /api/auth/me', () => {
  let token: string

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'alice@example.com',
      password: 'secret123',
      name: 'Alice',
    })
    token = res.body.data.token as string
  })

  it('returns current user when valid token is provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.user.email).toBe('alice@example.com')
    expect(res.body.data.user.password).toBeUndefined()
  })

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/auth/me')

    expect(res.status).toBe(401)
    expect(res.body.error).toBeDefined()
  })

  it('returns 401 when token is invalid', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken')

    expect(res.status).toBe(401)
    expect(res.body.error).toBeDefined()
  })
})
