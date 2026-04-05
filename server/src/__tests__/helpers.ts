import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function createTestUser(
  email = `test-${Date.now()}@example.com`,
  name = 'Test User'
): Promise<{ userId: string; token: string }> {
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  })

  const secret = process.env.JWT_SECRET ?? 'test-jwt-secret'
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' })

  return { userId: user.id, token }
}

export async function cleanDatabase(): Promise<void> {
  await prisma.habitLog.deleteMany()
  await prisma.habit.deleteMany()
  await prisma.user.deleteMany()
}

export { prisma as testPrisma }
