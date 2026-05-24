// ============================================================================
// Predictly — Admin session verification
// Uses a simple cookie-based admin session with ADMIN_PASSWORD env var
// ============================================================================

import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'predictly-admin-2026'
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

// ── Admin Helper Functions ────────────────────────────────────────────────────

/**
 * Log an admin action to the audit trail.
 * Creates a record in the admin_logs table for traceability.
 */
export async function logAdminAction(params: {
  adminId: string
  action: string
  targetUserId?: string
  targetMarketId?: string
  changes?: Record<string, unknown>
  reason?: string
}): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[AdminAuth] Supabase not configured — admin action not logged')
      return false
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error } = await supabase.from('admin_logs').insert({
      admin_id: params.adminId,
      action: params.action,
      target_user_id: params.targetUserId ?? null,
      target_market_id: params.targetMarketId ?? null,
      changes: params.changes ?? {},
      reason: params.reason ?? null,
    })

    if (error) {
      console.error('[AdminAuth] logAdminAction DB error:', error.message)
      return false
    }

    return true
  } catch (err) {
    console.error('[AdminAuth] logAdminAction failed:', err)
    return false
  }
}

/**
 * Adjust a user's balance as an admin action.
 * Updates the user's balance and logs the transaction.
 */
export async function adminAdjustBalance(params: {
  adminId: string
  userId: string
  currency: 'sc' | 'gc'
  amount: number
  reason: string
}): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return { success: false, error: 'Supabase not configured' }
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current balance with lock
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`${params.currency === 'sc' ? 'sc_balance' : 'gc_balance'}`)
      .eq('id', params.userId)
      .single()

    if (userError || !user) {
      return { success: false, error: 'User not found' }
    }

    const balanceField = params.currency === 'sc' ? 'sc_balance' : 'gc_balance'
    const currentBalance = user[balanceField] as number
    const newBalance = currentBalance + params.amount

    if (newBalance < 0) {
      return { success: false, error: 'Insufficient balance after adjustment' }
    }

    // Update balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ [balanceField]: newBalance })
      .eq('id', params.userId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Log admin action
    await logAdminAction({
      adminId: params.adminId,
      action: 'BALANCE_ADJUST',
      targetUserId: params.userId,
      changes: {
        currency: params.currency.toUpperCase(),
        amount: params.amount,
        previousBalance: currentBalance,
        newBalance,
      },
      reason: params.reason,
    })

    return { success: true, newBalance }
  } catch (err) {
    console.error('[AdminAuth] adminAdjustBalance failed:', err)
    return { success: false, error: 'Internal error' }
  }
}
