import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
  user?: { userId: string }
}

const JWT_SECRET =
  process.env.JWT_SECRET || 'dev-secret-change-in-production'

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return
  }

  const token = authHeader.slice(7)

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    req.user = { userId: payload.userId }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
