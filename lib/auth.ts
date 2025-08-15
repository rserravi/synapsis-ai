import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'
export const AUTH_COOKIE = 'token'

export function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string }
}

export function getUserIdFromRequest(req: NextRequest): string | null {
  const token = req.cookies.get(AUTH_COOKIE)?.value
  if (!token) return null
  try {
    const { userId } = verifyToken(token)
    return userId
  } catch {
    return null
  }
}
