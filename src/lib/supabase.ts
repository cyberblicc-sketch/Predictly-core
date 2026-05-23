// ============================================================================
// Predictly — Supabase client with RPC helpers
// Wraps all Supabase calls in try/catch with fallback to mock data
// ============================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type {
  User,
  Market,
  Position,
  Transaction,
  ProcessStakeResult,
  ResolveMarketResult,
  AdminStats,
  TradeInput,
  Currency,
} from '@/types'
import { markets as mockMarkets, transactions as mockTransactions, mockAdminStats } from './mockData'

// ── Client Creation ──────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

let supabaseInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[Supabase] Missing env vars — running in demo mode with mock data')
    return null
  }
  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    return supabaseInstance
  } catch (err) {
    console.error('[Supabase] Failed to create client:', err)
    return null
  }
}

/** Check whether Supabase is available */
export function isSupabaseAvailable(): boolean {
  return getSupabaseClient() !== null
}

// ── Auth Helpers ─────────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const client = getSupabaseClient()
  if (!client) return null
  try {
    const { data: { user }, error } = await client.auth.getUser()
    if (error) throw error
    return user
  } catch (err) {
    console.error('[Supabase] getCurrentUser failed:', err)
    return null
  }
}

export async function signInWithEmail(email: string, password: string) {
  const client = getSupabaseClient()
  if (!client) return { user: null, session: null, error: new Error('Supabase not configured') }
  try {
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { user: data.user, session: data.session, error: null }
  } catch (err) {
    return { user: null, session: null, error: err as Error }
  }
}

export async function signUpWithEmail(email: string, password: string, username: string) {
  const client = getSupabaseClient()
  if (!client) return { user: null, session: null, error: new Error('Supabase not configured') }
  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) throw error
    return { user: data.user, session: data.session, error: null }
  } catch (err) {
    return { user: null, session: null, error: err as Error }
  }
}

export async function signOut() {
  const client = getSupabaseClient()
  if (!client) return { error: null }
  try {
    const { error } = await client.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (err) {
    return { error: err as Error }
  }
}

export async function signInWithGoogle() {
  const client = getSupabaseClient()
  if (!client) return { error: new Error('Supabase not configured') }
  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback` },
    })
    if (error) throw error
    return { data, error: null }
  } catch (err) {
    return { error: err as Error }
  }
}

export async function signInWithApple() {
  const client = getSupabaseClient()
  if (!client) return { error: new Error('Supabase not configured') }
  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback` },
    })
    if (error) throw error
    return { data, error: null }
  } catch (err) {
    return { error: err as Error }
  }
}

// ── Data Helpers ─────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<User | null> {
  const client = getSupabaseClient()
  if (!client) return null
  try {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data as User
  } catch (err) {
    console.error('[Supabase] getUserProfile failed:', err)
    return null
  }
}

export async function getMarkets(category?: string): Promise<Market[]> {
  const client = getSupabaseClient()
  if (!client) return mockMarkets
  try {
    let query = client.from('markets').select('*').eq('status', 'active')
    if (category && category !== 'All') {
      query = query.eq('category', category)
    }
    const { data, error } = await query.order('volume', { ascending: false })
    if (error) throw error
    return (data as Market[]) ?? mockMarkets
  } catch (err) {
    console.error('[Supabase] getMarkets failed:', err)
    return mockMarkets
  }
}

export async function getMarketById(marketId: string): Promise<Market | null> {
  const client = getSupabaseClient()
  if (!client) return mockMarkets.find((m) => m.id === marketId) ?? null
  try {
    const { data, error } = await client
      .from('markets')
      .select('*')
      .eq('id', marketId)
      .single()
    if (error) throw error
    return data as Market
  } catch (err) {
    console.error('[Supabase] getMarketById failed:', err)
    return mockMarkets.find((m) => m.id === marketId) ?? null
  }
}

export async function getUserPositions(userId: string): Promise<Position[]> {
  const client = getSupabaseClient()
  if (!client) return []
  try {
    const { data, error } = await client
      .from('positions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as Position[]) ?? []
  } catch (err) {
    console.error('[Supabase] getUserPositions failed:', err)
    return []
  }
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const client = getSupabaseClient()
  if (!client) return mockTransactions
  try {
    const { data, error } = await client
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return (data as Transaction[]) ?? mockTransactions
  } catch (err) {
    console.error('[Supabase] getUserTransactions failed:', err)
    return mockTransactions
  }
}

export async function getCategories(): Promise<string[]> {
  const client = getSupabaseClient()
  if (!client) return ['Politics', 'Crypto', 'Sports', 'Tech', 'Economics', 'Pop Culture', 'Science', 'World', 'Stocks']
  try {
    const { data, error } = await client
      .from('markets')
      .select('category')
      .eq('status', 'active')
    if (error) throw error
    const unique = [...new Set((data as { category: string }[]).map((d) => d.category))]
    return unique.sort()
  } catch (err) {
    console.error('[Supabase] getCategories failed:', err)
    return ['Politics', 'Crypto', 'Sports', 'Tech', 'Economics', 'Pop Culture', 'Science', 'World', 'Stocks']
  }
}

// ── RPC Helpers ──────────────────────────────────────────────────────────────

export async function executeTrade(input: TradeInput): Promise<ProcessStakeResult | null> {
  const client = getSupabaseClient()
  if (!client) {
    // Demo mode — return simulated result
    return {
      position_id: `pos-${Date.now()}`,
      cost: input.stake,
      entry_prob: 0.5,
      new_balance: 50_000 - input.stake,
      side: input.side.toLowerCase() as 'yes' | 'no',
      currency: input.currency.toLowerCase() as 'gc' | 'sc',
    }
  }
  try {
    const { data, error } = await client.rpc('execute_trade', {
      p_market_id: input.marketId,
      p_side: input.side.toLowerCase(),
      p_stake: input.stake,
      p_currency: input.currency.toLowerCase(),
    })
    if (error) throw error
    return data as ProcessStakeResult
  } catch (err) {
    console.error('[Supabase] executeTrade failed:', err)
    return null
  }
}

export async function resolveMarket(
  marketId: string, outcome: string
): Promise<ResolveMarketResult | null> {
  const client = getSupabaseClient()
  if (!client) return null
  try {
    const { data, error } = await client.rpc('resolve_market', {
      p_market_id: marketId,
      p_outcome: outcome,
    })
    if (error) throw error
    return data as ResolveMarketResult
  } catch (err) {
    console.error('[Supabase] resolveMarket failed:', err)
    return null
  }
}

export async function applyReferral(
  referrerId: string, referredId: string
): Promise<boolean> {
  const client = getSupabaseClient()
  if (!client) return true
  try {
    const { error } = await client.rpc('apply_referral', {
      p_referrer_id: referrerId,
      p_referred_id: referredId,
    })
    if (error) throw error
    return true
  } catch (err) {
    console.error('[Supabase] applyReferral failed:', err)
    return false
  }
}

export async function redeemKyc(userId: string): Promise<boolean> {
  const client = getSupabaseClient()
  if (!client) return true
  try {
    const { error } = await client.rpc('redeem_kyc_reward', {
      p_user_id: userId,
    })
    if (error) throw error
    return true
  } catch (err) {
    console.error('[Supabase] redeemKyc failed:', err)
    return false
  }
}

export async function updateMarketProbability(
  marketId: string, probability: number
): Promise<boolean> {
  const client = getSupabaseClient()
  if (!client) return true
  try {
    const { error } = await client
      .from('markets')
      .update({ current_probability: probability })
      .eq('id', marketId)
    if (error) throw error
    return true
  } catch (err) {
    console.error('[Supabase] updateMarketProbability failed:', err)
    return false
  }
}

export async function redeemPosition(
  positionId: string, currency: Currency
): Promise<{ payout: number } | null> {
  const client = getSupabaseClient()
  if (!client) return { payout: 0 }
  try {
    const { data, error } = await client.rpc('redeem_position', {
      p_position_id: positionId,
      p_currency: currency.toLowerCase(),
    })
    if (error) throw error
    return data as { payout: number }
  } catch (err) {
    console.error('[Supabase] redeemPosition failed:', err)
    return null
  }
}

// ── Admin Helpers ────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const client = getSupabaseClient()
  if (!client) return mockAdminStats
  try {
    const { data, error } = await client.rpc('get_admin_stats')
    if (error) throw error
    return data as AdminStats
  } catch (err) {
    console.error('[Supabase] getAdminStats failed:', err)
    return mockAdminStats
  }
}

// ── Realtime Subscriptions ───────────────────────────────────────────────────

export function subscribeToMarket(
  marketId: string,
  onUpdate: (market: Market) => void
) {
  const client = getSupabaseClient()
  if (!client) return () => {}

  const channel = client
    .channel(`market-${marketId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'markets',
        filter: `id=eq.${marketId}`,
      },
      (payload) => {
        onUpdate(payload.new as Market)
      }
    )
    .subscribe()

  return () => {
    client.removeChannel(channel)
  }
}

export function subscribeToPositions(
  userId: string,
  onUpdate: (positions: Position[]) => void
) {
  const client = getSupabaseClient()
  if (!client) return () => {}

  const channel = client
    .channel(`positions-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'positions',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        // Refetch all positions on any change
        const positions = await getUserPositions(userId)
        onUpdate(positions)
      }
    )
    .subscribe()

  return () => {
    client.removeChannel(channel)
  }
}

// ── Exported client for direct access ────────────────────────────────────────

export const supabase = getSupabaseClient()
