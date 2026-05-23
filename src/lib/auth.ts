// ============================================================================
// Supreme Fusion — Server-side auth helpers using Supabase
// All functions are designed for use in Server Components / Route Handlers
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import type { User } from '@/types'
import { cookies } from 'next/headers'

// ── Server Client ────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export function createServerClient() {
  if (!SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }

  // Use service role key for server-side operations if available
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
  return createClient(SUPABASE_URL, key)
}

// ── Session & User ───────────────────────────────────────────────────────────

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('sb-access-token')?.value
    if (!authCookie) return null

    const client = createServerClient()
    const { data: { session }, error } = await client.auth.getSession()
    if (error) {
      console.error('[Auth] getSession error:', error.message)
      return null
    }
    return session
  } catch (err) {
    console.error('[Auth] getSession failed:', err)
    return null
  }
}

export async function getUser() {
  try {
    const session = await getSession()
    if (!session) return null

    const client = createServerClient()
    const { data: { user }, error } = await client.auth.getUser(session.access_token)
    if (error) {
      console.error('[Auth] getUser error:', error.message)
      return null
    }
    return user
  } catch (err) {
    console.error('[Auth] getUser failed:', err)
    return null
  }
}

// ── Sign Up / Sign In ────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, username: string) {
  try {
    const client = createServerClient()
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })
    if (error) throw error
    return { user: data.user, session: data.session, error: null }
  } catch (err) {
    return { user: null, session: null, error: err as Error }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const client = createServerClient()
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return { user: data.user, session: data.session, error: null }
  } catch (err) {
    return { user: null, session: null, error: err as Error }
  }
}

export async function signInWithOAuth(provider: 'google' | 'apple') {
  try {
    const client = createServerClient()
    const { data, error } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
      },
    })
    if (error) throw error
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err as Error }
  }
}

export async function signOut() {
  try {
    const client = createServerClient()
    const { error } = await client.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (err) {
    return { error: err as Error }
  }
}

// ── Profile Helpers ──────────────────────────────────────────────────────────

export async function isKycVerified(userId: string): Promise<boolean> {
  try {
    const client = createServerClient()
    const { data, error } = await client
      .from('users')
      .select('kyc_status')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data?.kyc_status === 'approved'
  } catch (err) {
    console.error('[Auth] isKycVerified failed:', err)
    return false
  }
}

export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const client = createServerClient()
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data as User
  } catch (err) {
    console.error('[Auth] getUserProfile failed:', err)
    return null
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'username' | 'avatar_url'>>
): Promise<boolean> {
  try {
    const client = createServerClient()
    const { error } = await client
      .from('users')
      .update(updates)
      .eq('id', userId)
    if (error) throw error
    return true
  } catch (err) {
    console.error('[Auth] updateUserProfile failed:', err)
    return false
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const client = createServerClient()
    const { data, error } = await client
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data?.is_admin === true
  } catch (err) {
    console.error('[Auth] isAdmin check failed:', err)
    return false
  }
}
