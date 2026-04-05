import { Router, Request, Response, NextFunction } from 'express'
import type { IRouter } from 'express'
import { prisma } from '../lib/prisma.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

const router: IRouter = Router()

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next)
  }
}

function getParam(req: Request, name: string): string {
  const value = req.params[name]
  return Array.isArray(value) ? value[0] : value
}

function parseDate(dateStr: string): Date {
  const date = new Date(`${dateStr}T00:00:00.000Z`)
  return date
}

function todayUTC(): Date {
  const now = new Date()
  now.setUTCHours(0, 0, 0, 0)
  return now
}

// POST /:id/toggle — Toggle habit completion for a given date
router.post(
  '/:id/toggle',
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId
    const id = getParam(req, 'id')
    const body = (req.body ?? {}) as { date?: unknown }

    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit) { res.status(404).json({ error: 'Habit not found' }); return }
    if (habit.userId !== userId) { res.status(403).json({ error: 'Forbidden' }); return }

    const date =
      typeof body.date === 'string' ? parseDate(body.date) : todayUTC()

    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId: id, date } },
    })

    if (existing) {
      await prisma.habitLog.delete({ where: { id: existing.id } })
      res.status(200).json({ data: { completed: false, log: null } })
      return
    }

    const log = await prisma.habitLog.create({
      data: { habitId: id, date },
    })

    res.status(200).json({ data: { completed: true, log } })
  })
)

// GET /logs — Get logs by date or range
router.get(
  '/logs',
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId
    const { date, from, to } = req.query as Record<string, string | undefined>

    if (!date && (!from || !to)) {
      res.status(400).json({ error: 'Provide date or from and to params' })
      return
    }

    const dateFilter = date
      ? { date: parseDate(date) }
      : { date: { gte: parseDate(from!), lte: parseDate(to!) } }

    const logs = await prisma.habitLog.findMany({
      where: {
        habit: { userId },
        ...dateFilter,
      },
      include: { habit: true },
      orderBy: { date: 'asc' },
    })

    res.status(200).json({ data: logs })
  })
)

export default router
