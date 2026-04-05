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

function startOfDayUTC(date: Date): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

function dateOnlyKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

// GET / — return aggregate stats for the authenticated user
router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId

    // Fetch all active habits
    const habits = await prisma.habit.findMany({
      where: { userId, isArchived: false },
    })

    const activeHabits = habits.length

    // --- Today stats ---
    const today = startOfDayUTC(new Date())
    const todayLogs = await prisma.habitLog.findMany({
      where: {
        habitId: { in: habits.map((h) => h.id) },
        date: today,
        completed: true,
      },
    })
    const todayCompleted = todayLogs.length
    const todayTotal = activeHabits
    const todayRate = todayTotal > 0 ? todayCompleted / todayTotal : 0

    // --- This month vs previous month ---
    const now = new Date()
    const thisMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const thisMonthEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)
    )
    const prevMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
    const prevMonthEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999)
    )

    const thisMonthLogs = await prisma.habitLog.count({
      where: {
        habitId: { in: habits.map((h) => h.id) },
        date: { gte: thisMonthStart, lte: thisMonthEnd },
        completed: true,
      },
    })
    const prevMonthLogs = await prisma.habitLog.count({
      where: {
        habitId: { in: habits.map((h) => h.id) },
        date: { gte: prevMonthStart, lte: prevMonthEnd },
        completed: true,
      },
    })

    // --- Streaks ---
    interface StreakResult {
      habitId: string
      habitName: string
      count: number
    }

    const streakResults: StreakResult[] = []

    for (const habit of habits) {
      const logs = await prisma.habitLog.findMany({
        where: { habitId: habit.id, completed: true },
        orderBy: { date: 'desc' },
      })

      if (logs.length === 0) {
        streakResults.push({ habitId: habit.id, habitName: habit.name, count: 0 })
        continue
      }

      // Build a set of completed date strings
      const completedDates = new Set(logs.map((l) => dateOnlyKey(new Date(l.date))))

      // Calculate current streak (consecutive days ending today or yesterday)
      let currentStreak = 0
      const checkDate = startOfDayUTC(new Date())

      // Allow streak to include today or start from yesterday
      if (!completedDates.has(dateOnlyKey(checkDate))) {
        checkDate.setUTCDate(checkDate.getUTCDate() - 1)
      }

      while (completedDates.has(dateOnlyKey(checkDate))) {
        currentStreak++
        checkDate.setUTCDate(checkDate.getUTCDate() - 1)
      }

      streakResults.push({ habitId: habit.id, habitName: habit.name, count: currentStreak })
    }

    // Best streak: find the longest ever consecutive streak per habit
    interface BestStreakResult {
      habitId: string
      habitName: string
      count: number
    }
    const bestStreakResults: BestStreakResult[] = []

    for (const habit of habits) {
      const logs = await prisma.habitLog.findMany({
        where: { habitId: habit.id, completed: true },
        orderBy: { date: 'asc' },
      })

      if (logs.length === 0) {
        bestStreakResults.push({ habitId: habit.id, habitName: habit.name, count: 0 })
        continue
      }

      const dates = logs.map((l) => dateOnlyKey(new Date(l.date)))
      let best = 1
      let current = 1

      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1] + 'T00:00:00.000Z')
        const curr = new Date(dates[i] + 'T00:00:00.000Z')
        const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        if (diffDays === 1) {
          current++
          if (current > best) best = current
        } else {
          current = 1
        }
      }

      bestStreakResults.push({ habitId: habit.id, habitName: habit.name, count: best })
    }

    // Sort current streaks descending
    const sortedCurrentStreaks = streakResults
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count)

    const overallBest = bestStreakResults.sort((a, b) => b.count - a.count)[0] ?? {
      habitId: '',
      habitName: '',
      count: 0,
    }

    // --- Category breakdown ---
    const categoryCounts: Record<string, number> = {}
    for (const habit of habits) {
      const cat = habit.category ?? 'Uncategorized'
      categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1
    }

    const categoryBreakdown = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      percentage: activeHabits > 0 ? count / activeHabits : 0,
    }))

    // --- Weekly heatmap (last 7 days Mon–Sun of the current week) ---
    // Build an array of the last 7 days (today and 6 days before)
    const weekDays: Date[] = []
    for (let i = 6; i >= 0; i--) {
      const d = startOfDayUTC(new Date())
      d.setUTCDate(d.getUTCDate() - i)
      weekDays.push(d)
    }

    const weekStart = weekDays[0]
    const weekEnd = weekDays[6]

    const weekLogs = await prisma.habitLog.findMany({
      where: {
        habitId: { in: habits.map((h) => h.id) },
        date: { gte: weekStart, lte: weekEnd },
        completed: true,
      },
    })

    const weeklyHeatmap = habits.map((habit) => {
      const habitLogs = weekLogs.filter((l) => l.habitId === habit.id)
      const completedSet = new Set(habitLogs.map((l) => dateOnlyKey(new Date(l.date))))
      const days = weekDays.map((d) => completedSet.has(dateOnlyKey(d)))
      return {
        habitId: habit.id,
        habitName: habit.name,
        days,
      }
    })

    res.status(200).json({
      data: {
        today: {
          completed: todayCompleted,
          total: todayTotal,
          rate: todayRate,
        },
        streaks: {
          best: {
            habitId: overallBest.habitId,
            habitName: overallBest.habitName,
            count: overallBest.count,
          },
          current: sortedCurrentStreaks,
        },
        thisMonth: {
          completions: thisMonthLogs,
          previousMonth: prevMonthLogs,
        },
        activeHabits,
        categoryBreakdown,
        weeklyHeatmap,
      },
    })
  })
)

export default router
