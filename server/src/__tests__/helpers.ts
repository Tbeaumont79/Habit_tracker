import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

export async function createTestUser(
  email = `test-${Date.now()}@example.com`,
  name = 'Test User'
): Promise<{ userId: string; token: string }> {
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  })

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })

  return { userId: user.id, token }
}

export async function cleanDatabase(): Promise<void> {
  await prisma.habitLog.deleteMany()
  await prisma.habit.deleteMany()
  await prisma.user.deleteMany()
}
