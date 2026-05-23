import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/admin', '/profile', '/portfolio', '/history', '/referrals']
// Routes that require admin
const adminRoutes = ['/admin']

// Routes that are only for non-authenticated users (login pages, etc)
const authRoutes = ['/auth/signin', '/auth/signup']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Create Supabase client to check auth
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/auth/signin', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing auth routes while logged in
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Admin route protection
  if (isAdminRoute && pathname !== '/admin/login') {
    // Check for admin token
    const adminToken = req.cookies.get('sb-admin-token')?.value

    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Verify admin token
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(adminToken)

      if (error || !user) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/portfolio/:path*',
    '/history/:path*',
    '/referrals/:path*',
    '/auth/:path*',
  ],
}