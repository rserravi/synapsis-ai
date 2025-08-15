import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, AUTH_COOKIE } from './lib/auth'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    verifyToken(token)
    return NextResponse.next()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
}

export const config = {
  matcher: '/api/:path*'
}
