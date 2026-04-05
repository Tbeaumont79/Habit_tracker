import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { authRoutes } from './routes/auth.js'
import { authMiddleware } from './middleware/auth.js'
import habitsRouter from './routes/habits.js'
import trackingRouter from './routes/tracking.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  // Health endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // API routes
  app.use('/api/auth', authRoutes)
  app.use('/api/habits', authMiddleware, habitsRouter)
  app.use('/api/tracking', authMiddleware, trackingRouter)

  // Global error handler
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ error: 'Internal server error' })
  })

  return app
}
