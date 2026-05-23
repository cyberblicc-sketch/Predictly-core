export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  gold_balance: number
  sweeps_balance: number
  kyc_status: 'pending' | 'approved' | 'rejected' | 'none'
  created_at: string
}

export interface Market {
  id: string
  title: string
  description: string
  category: string
  subcategory?: string
  close_date: string
  resolved: boolean
  resolution?: 'YES' | 'NO' | 'CANCELLED'
  yes_price: number
  no_price: number
  volume: number
  participants: number
  created_at: string
  creator_id?: string
}

export interface Position {
  id: string
  user_id: string
  market_id: string
  side: 'YES' | 'NO'
  stake: number
  entry_price: number
  current_price: number
  pnl: number
  created_at: string
  market?: Market
}

export interface Transaction {
  id: string
  user_id: string
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE' | 'REFERRAL' | 'KYC_REWARD' | 'BET' | 'SETTLEMENT'
  amount: number
  currency: 'GC' | 'SC'
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
  description: string
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  status: 'PENDING' | 'COMPLETED'
  reward_claimed: boolean
  created_at: string
  referred_user?: User
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url?: string
  total_winnings: number
  win_rate: number
  trades: number
}

export type Currency = 'GC' | 'SC'

export interface TradeInput {
  market_id: string
  side: 'YES' | 'NO'
  stake: number
  currency: Currency
}

export interface FeeBreakdown {
  stake: number
  houseFee: number
  platformFee: number
  poolShare: number
  entryPrice: number
}

export interface ChartDataPoint {
  timestamp: string
  price: number
  volume?: number
}