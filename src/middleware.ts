import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================================
// Supreme Fusion — Route protection middleware
// ============================================================================

// Route classification
const PROTECTED_ROUTES = [
  '/dashboard',
  '/portfolio',
  '/markets/',  // only trade sub-routes
  '/profile',
  '/history',
  '/referrals',
  '/kyc',
]

const ADMIN_ROUTES = ['/admin']
const ADMIN_LOGIN_ROUTE = '/admin/login'

const PUBLIC_ROUTES = [
  '/',
  '/signin',
  '/signup',
  '/markets',
  '/api',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── API routes: always pass through ──────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // ── Admin login: always pass through ─────────────────────────────────────
  if (pathname === ADMIN_LOGIN_ROUTE) {
    return NextResponse.next()
  }

  // ── Admin routes: check admin_session cookie ─────────────────────────────
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    // TODO: In production, verify a signed JWT or session token here.
    // For demo mode, we allow all admin routes through — the client-side
    // admin layout and API routes handle their own auth checks.
    //
    // Production implementation:
    //   const adminSession = request.cookies.get('admin_session')
    //   if (!adminSession || !verifyToken(adminSession.value)) {
    //     return NextResponse.redirect(new URL('/admin/login', request.url))
    //   }
    return NextResponse.next()
  }

  // ── Protected routes: check user auth ────────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((route) => {
    if (route.endsWith('/')) {
      // Special case: /markets/ only protects sub-routes (like /markets/abc/trade)
      // but NOT /markets itself or /markets/[id] view pages
      if (route === '/markets/') {
        return pathname.includes('/trade')
      }
      return pathname.startsWith(route)
    }
    return pathname.startsWith(route)
  })

  if (isProtected) {
    // TODO: In production, check for a valid user session/token here.
    // For demo mode, we allow all protected routes through.
    //
    // Production implementation:
    //   const session = request.cookies.get('session')
    //   if (!session || !verifyToken(session.value)) {
    //     const signInUrl = new URL('/signin', request.url)
    //     signInUrl.searchParams.set('callbackUrl', pathname)
    //     return NextResponse.redirect(signInUrl)
    //   }
    return NextResponse.next()
  }

  // ── Public routes: always pass through ───────────────────────────────────
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
