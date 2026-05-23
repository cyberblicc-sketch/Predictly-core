import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle error from OAuth provider
  if (error) {
    return NextResponse.redirect(
      new URL(`/signin?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  // If we have a code, exchange it for a session
  if (code) {
    try {
      // In production, this would exchange the code with the OAuth provider
      // and create a session. For now, redirect to dashboard.
      
      // Example:
      // const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      // if (error) throw error
      
      return NextResponse.redirect(
        new URL('/dashboard?welcome=true', request.url)
      )
    } catch (err) {
      console.error('OAuth callback error:', err)
      return NextResponse.redirect(
        new URL('/signin?error=callback_failed', request.url)
      )
    }
  }

  // No code provided, redirect to signin
  return NextResponse.redirect(
    new URL('/signin?error=no_code', request.url)
  )
}