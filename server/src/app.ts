import express from 'express'
import cors from 'cors'
import { authMiddleware } from './middleware/auth.js'
import habitsRouter from './routes/habits.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  // Health endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // API routes
  app.use('/api/habits', authMiddleware, habitsRouter)

  return app
}
