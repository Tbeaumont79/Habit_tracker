import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { authMiddleware } from './middleware/auth.js'
import habitsRouter from './routes/habits.js'

export function createApp(): Express {
  const app = express()

  app.use(cors())
  app.use(express.json())

  // Health endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // API routes
  app.use('/api/habits', authMiddleware, habitsRouter)

  // Global error handler — catches errors forwarded via next(err) from asyncHandler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  })

  return app
}
