import express from 'express'
import cors from 'cors'
import { authRoutes } from './routes/auth.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  // Health endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api/auth', authRoutes)

  return app
}
