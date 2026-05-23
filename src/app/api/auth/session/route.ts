import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

const SESSION_SECRET =
  process.env.SESSION_SECRET || 'predictly-session-secret-2026'

function createSessionToken(userId: string): string {
  const timestamp = Date.now().toString()
  const sig = createHmac('sha256', SESSION_SECRET)
    .update(`${userId}:${timestamp}`)
    .digest('hex')
    .slice(0, 16)
  return `${userId}:${timestamp}:${sig}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const token = createSessionToken(userId)

    const response = NextResponse.json({ success: true })
    response.cookies.set('predictly_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error: unknown) {
    console.error('[Auth] Session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.set('predictly_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}
