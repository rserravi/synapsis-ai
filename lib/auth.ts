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

/**
 * Extracts the userId from either the auth cookie or the Authorization header.
 * Returns null if no valid token is present.
 */
export function getUserIdFromRequest(req: NextRequest): string | null {
  let token = req.cookies.get(AUTH_COOKIE)?.value

  if (!token) {
    const authHeader = req.headers.get('Authorization') || ''
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    } else if (authHeader) {
      token = authHeader
    }
  }

  if (!token) return null
  try {
    const { userId } = verifyToken(token)
    return userId
  } catch {
    return null
  }
}
