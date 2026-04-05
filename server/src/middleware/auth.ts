import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
}

interface JwtPayload {
  userId: string
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const token = authHeader.slice(7)
  const secret = process.env.JWT_SECRET

  if (!secret) {
    res.status(500).json({ error: 'Server configuration error' })
    return
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
