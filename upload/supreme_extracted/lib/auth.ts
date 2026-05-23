import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Create a Supabase client for server-side operations
export async function createServerClient() {
  const cookieStore = await cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // This can fail in Middleware
          }
        },
      },
    }
  )
}

// Get current session
export async function getSession() {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Get current user
export async function getUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Sign up with email
export async function signUp(email: string, password: string, metadata?: Record<string, unknown>) {
  const supabase = await createServerClient()
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })
}

// Sign in with email/password
export async function signIn(email: string, password: string) {
  const supabase = await createServerClient()
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

// Sign in with OAuth (Google, Apple)
export async function signInWithOAuth(provider: 'google' | 'apple', redirectTo?: string) {
  const supabase = await createServerClient()
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
}

// Sign out
export async function signOut() {
  const supabase = await createServerClient()
  return supabase.auth.signOut()
}

// Update user metadata
export async function updateUser(metadata: Record<string, unknown>) {
  const supabase = await createServerClient()
  return supabase.auth.updateUser({
    data: metadata,
  })
}

// Request password reset
export async function resetPassword(email: string) {
  const supabase = await createServerClient()
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })
}

// Verify email with OTP
export async function verifyOtp(email: string, token: string) {
  const supabase = await createServerClient()
  return supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })
}

// Send phone verification code
export async function sendPhoneVerification(phone: string) {
  const supabase = await createServerClient()
  return supabase.auth.signInWithOtp({
    phone,
  })
}

// Verify phone with OTP
export async function verifyPhone(phone: string, token: string) {
  const supabase = await createServerClient()
  return supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })
}

// Check if user has completed KYC
export async function isKycVerified(userId: string): Promise<boolean> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('users')
    .select('kyc_status')
    .eq('id', userId)
    .single()

  return data?.kyc_status === 'verified'
}

// Get user profile
export async function getUserProfile(userId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  return data
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  const supabase = await createServerClient()
  return supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
}

// Check if user is admin
export async function isAdmin(userId?: string): Promise<boolean> {
  if (!userId) return false

  const supabase = await createServerClient()
  const { data } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single()

  return data?.is_admin === true
}