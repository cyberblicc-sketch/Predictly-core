import { NextRequest, NextResponse } from 'next/server'

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
      // In production: exchange the authorization code for a session
      // Example with Supabase:
      // const supabase = createServerClient(...)
      // const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      // if (exchangeError) throw exchangeError

      // For demo: simulate successful auth and redirect to dashboard
      console.log('[OAuth Callback] Code received:', code.substring(0, 8) + '...')

      const dashboardUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(dashboardUrl)
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
