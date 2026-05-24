import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================================
// Predictly — Route protection middleware
// Checks predictly_session cookie for protected routes
// Uses Web Crypto API (Edge Runtime compatible)
// ============================================================================

const SESSION_SECRET = process.env.SESSION_SECRET || 'predictly-session-secret-2026'

// Route classification
const PROTECTED_ROUTES = [
  '/dashboard',
  '/portfolio',
  '/profile',
  '/history',
  '/referrals',
  '/kyc',
  '/promotions',
  '/watchlist',
  '/withdrawal',
  '/sponsored',
  '/docs',
]

const ADMIN_ROUTES = ['/admin']
const ADMIN_LOGIN_ROUTE = '/admin/login'

/** Verify the predictly_session cookie token (Edge-compatible) */
async function verifySession(cookieValue: string): Promise<{ userId: string; valid: boolean }> {
  try {
    const parts = cookieValue.split(':')
    if (parts.length !== 3) return { userId: '', valid: false }
    const [userId, timestamp, sig] = parts

    // Import the secret key for HMAC
    const encoder = new TextEncoder()
    const keyData = encoder.encode(SESSION_SECRET)
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    // Compute the expected signature
    const message = encoder.encode(`${userId}:${timestamp}`)
    const signature = await crypto.subtle.sign('HMAC', key, message)
    const sigArray = new Uint8Array(signature)
    // Take first 8 bytes and convert to hex (16 hex chars) to match server-side .slice(0, 16)
    const expectedSig = Array.from(sigArray.slice(0, 8))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (sig !== expectedSig) return { userId: '', valid: false }

    // Check if session is less than 7 days old
    const sessionAge = Date.now() - parseInt(timestamp)
    if (sessionAge > 7 * 24 * 60 * 60 * 1000) return { userId: '', valid: false }

    return { userId, valid: true }
  } catch {
    return { userId: '', valid: false }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── API routes: always pass through ──────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // ── Static assets: always pass through ───────────────────────────────────
  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // ── Admin login: always pass through ─────────────────────────────────────
  if (pathname === ADMIN_LOGIN_ROUTE) {
    return NextResponse.next()
  }

  // ── Admin routes: check admin_session cookie ─────────────────────────────
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    const adminSession = request.cookies.get('admin_session')
    if (!adminSession?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // ── Protected routes: check user session cookie ──────────────────────────
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isProtected) {
    const sessionCookie = request.cookies.get('predictly_session')
    if (!sessionCookie?.value) {
      const signInUrl = new URL('/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    const { valid } = await verifySession(sessionCookie.value)
    if (!valid) {
      const signInUrl = new URL('/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      const response = NextResponse.redirect(signInUrl)
      // Clear invalid session
      response.cookies.set('predictly_session', '', { maxAge: 0, path: '/' })
      return response
    }

    return NextResponse.next()
  }

  // ── Public routes: always pass through ───────────────────────────────────
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
