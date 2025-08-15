import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const secure =
      process.env.AUTH_COOKIE_SECURE !== undefined
        ? process.env.AUTH_COOKIE_SECURE === 'true'
        : req.nextUrl.protocol === 'https:'
    const res = NextResponse.json({ success: true })
    res.cookies.set(AUTH_COOKIE, '', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return res
  } catch (error) {
    console.error('Error in logout:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
