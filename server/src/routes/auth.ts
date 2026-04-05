import { Router } from 'express'
import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { validateEmail, validatePassword, validateName } from '../lib/validation.js'
import { requireAuth } from '../middleware/auth.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router = Router()

const JWT_SECRET =
  process.env.JWT_SECRET || 'dev-secret-change-in-production'

function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body as Record<string, unknown>

  if (!validateEmail(email) || !validatePassword(password) || !validateName(name)) {
    const missing = !email || !password || !name
    res.status(400).json({
      error: missing ? 'email, password and name are required' : 'Invalid input',
    })
    return
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: 'Email already in use' })
    return
  }

  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hash, name },
    select: { id: true, email: true, name: true, createdAt: true },
  })

  res.status(201).json({ data: { token: signToken(user.id), user } })
})

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as Record<string, unknown>

  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'email and password are required' })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const { password: _pw, ...safeUser } = user
  res.status(200).json({ data: { token: signToken(user.id), user: safeUser } })
})

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  })

  if (!user) {
    res.status(401).json({ error: 'User not found' })
    return
  }

  res.status(200).json({ data: { user } })
})

export { router as authRoutes }
