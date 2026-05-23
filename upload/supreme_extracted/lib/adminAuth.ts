import { supabase } from './supabase'
import { cookies } from 'next/headers'

/**
 * Verify if the current session belongs to an admin user
 */
export async function verifyAdminSession(session: any): Promise<any | null> {
  if (!session?.user) return null
  
  const { data: user } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()
  
  return user?.is_admin ? session : null
}

/**
 * Get admin user from request cookies
 */
export async function getAdminFromCookies() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value
  
  if (!accessToken) return null
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) return null
  
  return verifyAdminSession({ user })
}

/**
 * Check if user is admin by user ID
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single()
  
  return user?.is_admin === true
}

/**
 * Require admin authentication - throws if not admin
 */
export async function requireAdmin() {
  const admin = await getAdminFromCookies()
  if (!admin) {
    throw new Error('Unauthorized - Admin access required')
  }
  return admin
}

/**
 * Log admin action to admin_logs table
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetUserId?: string,
  targetMarketId?: string,
  changes?: Record<string, any>,
  reason?: string
) {
  await supabase.from('admin_logs').insert({
    admin_id: adminId,
    action,
    target_user_id: targetUserId || null,
    target_market_id: targetMarketId || null,
    changes: changes || {},
    reason: reason || null
  })
}

/**
 * Admin balance adjustment with balance logging
 */
export async function adminAdjustBalance(
  adminId: string,
  userId: string,
  currency: 'gc' | 'sc',
  amount: number,
  reason: string
) {
  // Verify admin status
  if (!(await isAdmin(adminId))) {
    throw new Error('Admin only operation')
  }

  // Get current user balance
  const { data: user } = await supabase
    .from('users')
    .select(`${currency}_balance`)
    .eq('id', userId)
    .single()

  if (!user) throw new Error('User not found')

  const balanceKey = `${currency}_balance` as const
  const currentBalance = user[balanceKey] as number
  const newBalance = currentBalance + amount

  // Update balance
  const { error } = await supabase
    .from('users')
    .update({ [balanceKey]: newBalance })
    .eq('id', userId)

  if (error) throw error

  // Log the action
  await logAdminAction(adminId, 'BALANCE_ADJUST', userId, undefined, { currency, amount }, reason)

  // Create transaction record
  await supabase.from('transactions').insert({
    user_id: userId,
    type: amount > 0 ? 'DEPOSIT' : 'WITHDRAWAL',
    amount: Math.abs(amount),
    currency,
    balance_before: currentBalance,
    balance_after: newBalance,
    status: 'completed',
    description: `Admin ${amount > 0 ? 'deposit' : 'withdrawal'}: ${reason}`
  })

  return { success: true, newBalance }
}