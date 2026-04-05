import { Router, IRouter, Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma.js'
import { AuthRequest } from '../middleware/auth.js'
import { Frequency } from '@prisma/client'

const router: IRouter = Router()

// Utility: wrap async route handlers to forward errors to Express error handler
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next)
  }
}

// Utility: extract a route param as a plain string (Express 5 params are string | string[])
function getParam(req: Request, name: string): string {
  const value = req.params[name]
  return Array.isArray(value) ? value[0] : value
}

interface CreateHabitBody {
  name?: unknown
  description?: unknown
  icon?: unknown
  color?: unknown
  frequency?: unknown
  targetDays?: unknown
  category?: unknown
}

interface UpdateHabitBody {
  name?: unknown
  description?: unknown
  icon?: unknown
  color?: unknown
  frequency?: unknown
  targetDays?: unknown
  category?: unknown
}

interface ReorderEntry {
  id: string
  position: number
}

interface ReorderBody {
  habits?: unknown
}

function isValidFrequency(value: unknown): value is Frequency {
  return value === 'DAILY' || value === 'WEEKLY' || value === 'CUSTOM'
}

function isValidReorderEntry(value: unknown): value is ReorderEntry {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.id === 'string' &&
    (typeof entry.position === 'number' || typeof entry.position === 'string')
  )
}

// POST / — create habit
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId as string
    const body = req.body as CreateHabitBody

    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      res.status(400).json({ error: 'Name is required' })
      return
    }

    const frequency =
      body.frequency !== undefined && isValidFrequency(body.frequency)
        ? body.frequency
        : undefined

    const habit = await prisma.habit.create({
      data: {
        userId,
        name: body.name.trim(),
        description:
          typeof body.description === 'string' ? body.description : undefined,
        icon: typeof body.icon === 'string' ? body.icon : undefined,
        color: typeof body.color === 'string' ? body.color : undefined,
        frequency,
        targetDays:
          typeof body.targetDays === 'number' ? body.targetDays : undefined,
        category:
          typeof body.category === 'string' ? body.category : undefined,
      },
    })

    res.status(201).json({ data: habit })
  })
)

// GET / — list habits for current user
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId as string
    const category =
      typeof req.query.category === 'string' ? req.query.category : undefined

    const habits = await prisma.habit.findMany({
      where: {
        userId,
        ...(category ? { category } : {}),
      },
      orderBy: { position: 'asc' },
    })

    res.status(200).json({ data: habits })
  })
)

// PUT /:id — update habit
router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId as string
    const id = getParam(req, 'id')
    const body = req.body as UpdateHabitBody

    const existing = await prisma.habit.findUnique({ where: { id } })

    if (!existing) {
      res.status(404).json({ error: 'Habit not found' })
      return
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    const frequency =
      body.frequency !== undefined && isValidFrequency(body.frequency)
        ? body.frequency
        : undefined

    const habit = await prisma.habit.update({
      where: { id },
      data: {
        ...(typeof body.name === 'string' ? { name: body.name.trim() } : {}),
        ...(typeof body.description === 'string'
          ? { description: body.description }
          : {}),
        ...(typeof body.icon === 'string' ? { icon: body.icon } : {}),
        ...(typeof body.color === 'string' ? { color: body.color } : {}),
        ...(frequency ? { frequency } : {}),
        ...(typeof body.targetDays === 'number'
          ? { targetDays: body.targetDays }
          : {}),
        ...(typeof body.category === 'string' ? { category: body.category } : {}),
      },
    })

    res.status(200).json({ data: habit })
  })
)

// PATCH /reorder — update positions (must come before /:id routes)
router.patch(
  '/reorder',
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId as string
    const body = req.body as ReorderBody

    if (!Array.isArray(body.habits)) {
      res.status(400).json({ error: 'habits array is required' })
      return
    }

    // Validate each entry has id (string) and position (string or number)
    const invalidEntry = body.habits.find((e) => !isValidReorderEntry(e))
    if (invalidEntry !== undefined) {
      res
        .status(400)
        .json({ error: 'Each entry must have a string id and numeric position' })
      return
    }

    const entries: ReorderEntry[] = body.habits.map((e) => ({
      id: (e as ReorderEntry).id,
      position: Number((e as ReorderEntry).position),
    }))

    // Verify all habits belong to the requesting user
    const ids = entries.map((e) => e.id)
    const habits = await prisma.habit.findMany({
      where: { id: { in: ids } },
      select: { id: true, userId: true },
    })

    const notOwned = habits.some((h) => h.userId !== userId)
    if (notOwned || habits.length !== ids.length) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    await prisma.$transaction(
      entries.map((entry) =>
        prisma.habit.update({
          where: { id: entry.id },
          data: { position: entry.position },
        })
      )
    )

    res.status(200).json({ message: 'Positions updated' })
  })
)

// PATCH /:id/archive — toggle archive status
router.patch(
  '/:id/archive',
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId as string
    const id = getParam(req, 'id')

    const existing = await prisma.habit.findUnique({ where: { id } })

    if (!existing) {
      res.status(404).json({ error: 'Habit not found' })
      return
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    const habit = await prisma.habit.update({
      where: { id },
      data: { isArchived: !existing.isArchived },
    })

    res.status(200).json({ data: habit })
  })
)

// DELETE /:id — delete habit
router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId as string
    const id = getParam(req, 'id')

    const existing = await prisma.habit.findUnique({ where: { id } })

    if (!existing) {
      res.status(404).json({ error: 'Habit not found' })
      return
    }

    if (existing.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    await prisma.habit.delete({ where: { id } })

    res.status(204).send()
  })
)

export default router
