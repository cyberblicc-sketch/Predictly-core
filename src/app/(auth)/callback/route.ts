import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createHmac } from 'crypto'

const prisma = new PrismaClient()

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth error response
  if (error) {
    console.error('[OAuth Callback] Error:', error, errorDescription)
    const signInUrl = new URL('/signin', request.url)
    signInUrl.searchParams.set('error', error)
    if (errorDescription) {
      signInUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(signInUrl)
  }

  // Exchange code for session
  if (code) {
    try {
      console.log('[OAuth Callback] Code received:', code.substring(0, 8) + '...')

      // In a full production flow, exchange the code with the OAuth provider
      // to get user info (email, name, etc.). For demo mode, we create/find
      // a user from the OAuth flow.

      // For demo: look up or create the demo user to associate with the session
      // In production, you would:
      // 1. Exchange the code with the OAuth provider for an access token
      // 2. Fetch user profile from the provider
      // 3. Find or create a User record in the database
      // 4. Create a session

      let userId: string | null = null

      // Try to find the demo user as a fallback for demo mode
      const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@predictly.io' },
      })

      if (demoUser) {
        userId = demoUser.id
      }

      if (!userId) {
        console.error('[OAuth Callback] No user found for OAuth callback')
        const signInUrl = new URL('/signin', request.url)
        signInUrl.searchParams.set('error', 'user_not_found')
        return NextResponse.redirect(signInUrl)
      }

      // Create session token
      const token = createSessionToken(userId)

      // Log the OAuth sign-in
      await prisma.authLog.create({
        data: {
          user_id: userId,
          action: 'OAUTH',
          details: 'OAuth callback successful',
          ip_address:
            request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        },
      })

      // Redirect to dashboard with session cookie
      const dashboardUrl = new URL('/dashboard', request.url)
      const response = NextResponse.redirect(dashboardUrl)
      response.cookies.set('predictly_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
      return response
    } catch (err) {
      console.error('[OAuth Callback] Code exchange failed:', err)
      const signInUrl = new URL('/signin', request.url)
      signInUrl.searchParams.set('error', 'callback_failed')
      return NextResponse.redirect(signInUrl)
    }
  }

  // No code or error — redirect to sign-in
  return NextResponse.redirect(new URL('/signin', request.url))
}
