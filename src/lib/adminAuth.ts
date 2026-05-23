// ============================================================================
// Supreme Fusion — Admin session verification
// Uses a simple cookie-based admin session with ADMIN_PASSWORD env var
// ============================================================================

import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'supreme-admin-2026'
const ADMIN_SESSION_COOKIE = 'admin_session'
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8 // 8 hours

// ── Verify ───────────────────────────────────────────────────────────────────

/**
 * Verify the current request has a valid admin session cookie.
 * Compares the cookie value against the ADMIN_PASSWORD env variable.
 * Returns true if valid, false otherwise.
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)

    if (!sessionCookie?.value) {
      return false
    }

    // Simple string comparison — do NOT use bcrypt
    // The cookie stores the admin password directly for demo purposes
    // In production, use a signed JWT or session token
    return sessionCookie.value === ADMIN_PASSWORD
  } catch (err) {
    console.error('[AdminAuth] verifyAdminSession failed:', err)
    return false
  }
}

// ── Create ───────────────────────────────────────────────────────────────────

/**
 * Create an admin session by setting the admin_session cookie.
 * Called after successful password verification via the admin login API.
 */
export async function createAdminSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set(ADMIN_SESSION_COOKIE, ADMIN_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: '/',
    })
  } catch (err) {
    console.error('[AdminAuth] createAdminSession failed:', err)
    throw new Error('Failed to create admin session')
  }
}

// ── Clear ────────────────────────────────────────────────────────────────────

/**
 * Clear the admin session cookie, effectively logging out the admin.
 */
export async function clearAdminSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(ADMIN_SESSION_COOKIE)
  } catch (err) {
    console.error('[AdminAuth] clearAdminSession failed:', err)
    throw new Error('Failed to clear admin session')
  }
}
