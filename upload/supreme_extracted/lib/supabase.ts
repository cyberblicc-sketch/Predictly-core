import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for RPC responses
export interface ProcessStakeResult {
  position_id: string
  cost: number
  entry_prob: number
  new_balance: number
  lmsr_subsidy: number
  side: 'yes' | 'no'
  currency: 'sc' | 'gc'
}

export interface ResolveMarketResult {
  success: boolean
  outcome: string
  settled_count: number
  total_payout: number
  protocol_fee: number
  publisher_fee: number
  market_id: string
}

export interface ApplyReferralResult {
  success: boolean
  message: string
  reward_sc: number
  reward_gold: number
  new_sc_balance: number
  new_gc_balance: number
}

export interface RedeemKycResult {
  success: boolean
  redemption_id: string
  amount_sc: number
  amount_usd: number
  method: string
  new_balance: number
  status: string
  message: string
}

export interface UpdateMarketProbabilityResult {
  success: boolean
  market_id: string
  yes_probability: number
  no_probability: number
  total_pool_sc: number
  lmsr_active: boolean
  updated: boolean
}

export interface RedeemPositionResult {
  success: boolean
  position_id: string
  redemption_value: number
  exit_fee: number
  entry_prob: number
  current_prob: number
  profit: number
  new_balance: number
  currency: 'sc' | 'gc'
}

// RPC Helper Functions

/**
 * Execute a trade (place a stake on a market)
 */
export async function executeTrade(
  userId: string,
  marketId: string,
  side: 'yes' | 'no',
  amount: number,
  currency: 'sc' | 'gc'
): Promise<ProcessStakeResult> {
  const { data, error } = await supabase.rpc('process_stake', {
    p_user_id: userId,
    p_market_id: marketId,
    p_side: side,
    p_amount: amount,
    p_currency: currency
  })
  if (error) throw new Error(error.message)
  return data as ProcessStakeResult
}

/**
 * Resolve a market (admin only)
 */
export async function resolveMarket(
  marketId: string,
  outcome: 'yes' | 'no' | 'invalid' | 'cancel',
  evidence: string,
  adminId: string
): Promise<ResolveMarketResult> {
  const { data, error } = await supabase.rpc('resolve_market', {
    p_market_id: marketId,
    p_outcome: outcome,
    p_resolution_source: evidence,
    p_admin_id: adminId
  })
  if (error) throw new Error(error.message)
  return data as ResolveMarketResult
}

/**
 * Apply referral reward to referrer
 */
export async function applyReferral(
  referrerId: string,
  referredUserId: string,
  depositAmount: number
): Promise<ApplyReferralResult> {
  const { data, error } = await supabase.rpc('apply_referral_reward', {
    p_referrer_id: referrerId,
    p_referred_user_id: referredUserId,
    p_deposit_amount: depositAmount
  })
  if (error) throw new Error(error.message)
  return data as ApplyReferralResult
}

/**
 * Redeem SC for USD (KYC required)
 */
export async function redeemKyc(
  userId: string,
  amountSc: number,
  method: 'ach' | 'check' | 'paypal' | 'gift_card'
): Promise<RedeemKycResult> {
  const { data, error } = await supabase.rpc('redeem_kyc', {
    p_user_id: userId,
    p_amount_sc: amountSc,
    p_method: method
  })
  if (error) throw new Error(error.message)
  return data as RedeemKycResult
}

/**
 * Update market probability based on pool ratios
 */
export async function updateMarketProbability(
  marketId: string
): Promise<UpdateMarketProbabilityResult> {
  const { data, error } = await supabase.rpc('update_market_probability', {
    p_market_id: marketId
  })
  if (error) throw new Error(error.message)
  return data as UpdateMarketProbabilityResult
}

/**
 * Early exit from a position
 */
export async function redeemPosition(
  positionId: string,
  userId: string
): Promise<RedeemPositionResult> {
  const { data, error } = await supabase.rpc('redeem_position', {
    p_position_id: positionId,
    p_user_id: userId
  })
  if (error) throw new Error(error.message)
  return data as RedeemPositionResult
}

// Auth helpers

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string, metadata?: Record<string, any>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Google OAuth
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  if (error) throw error
  return data
}

// Apple Sign-In
export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  if (error) throw error
  return data
}

// Database helpers with RLS

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function getPublicProfile(handle: string) {
  // Returns profile without sensitive balance info
  const { data, error } = await supabase
    .from('users')
    .select('id, name, handle, user_tier, created_at, referral_code')
    .eq('handle', handle)
    .single()
  if (error) throw error
  return data
}

export async function getMarkets(filters?: {
  status?: string
  category?: string
  search?: string
  sort?: string
  limit?: number
}) {
  let query = supabase
    .from('markets')
    .select(`
      *,
      categories (id, name, slug, icon),
      users!markets_publisher_id_fkey (id, handle, user_tier)
    `)

  if (filters?.status) {
    query = query.eq('status', filters.status)
  } else {
    query = query.in('status', ['active', 'paused', 'resolved'])
  }

  if (filters?.category) {
    query = query.eq('categories.slug', filters.category)
  }

  if (filters?.search) {
    query = query.or(`question.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.sort === 'volume') {
    query = query.order('total_volume_sc', { ascending: false })
  } else if (filters?.sort === 'date') {
    query = query.order('created_at', { ascending: false })
  } else if (filters?.sort === 'expiry') {
    query = query.order('expires_at', { ascending: true, nullsFirst: false })
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getMarketById(marketId: string) {
  const { data, error } = await supabase
    .from('markets')
    .select(`
      *,
      categories (id, name, slug, icon),
      users!markets_publisher_id_fkey (id, handle, user_tier, avatar)
    `)
    .eq('id', marketId)
    .single()
  if (error) throw error
  return data
}

export async function getUserPositions(userId: string) {
  const { data, error } = await supabase
    .from('positions')
    .select(`
      *,
      markets (*)
    `)
    .eq('user_id', userId)
    .eq('is_settled', false)
    .eq('is_redeemed', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getUserTransactions(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

export async function getRedemptionRequests(userId: string) {
  const { data, error } = await supabase
    .from('redemption_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Admin helpers

export async function getAdminStats() {
  const { data: activeMkts } = await supabase
    .from('markets')
    .select('id')
    .eq('status', 'active')
    .count()

  const { data: totalUsers } = await supabase
    .from('users')
    .select('id')
    .count()

  const { data: pendingKyc } = await supabase
    .from('users')
    .select('id')
    .eq('kyc_status', 'pending')
    .count()

  const { data: pendingRedemptions } = await supabase
    .from('redemption_requests')
    .select('id, amount_sc')
    .eq('status', 'pending')

  const pendingRedemptionTotal = pendingRedemptions?.reduce((sum, r) => sum + Number(r.amount_sc), 0) || 0

  return {
    active_markets: activeMkts?.length || 0,
    total_users: totalUsers?.length || 0,
    pending_kyc: pendingKyc?.length || 0,
    pending_redemptions: pendingRedemptions?.length || 0,
    pending_redemption_total: pendingRedemptionTotal
  }
}

// Realtime subscriptions

export function subscribeToMarket(marketId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`market:${marketId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'markets',
      filter: `id=eq.${marketId}`
    }, callback)
    .subscribe()
}

export function subscribeToPositions(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`positions:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'positions',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()
}

export function subscribeToTransactions(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`transactions:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'transactions',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()
}