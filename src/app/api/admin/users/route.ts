import { NextResponse } from 'next/server'
import { mockUser } from '@/lib/mockData'

// In-memory mock users for demo
const mockUsers = [
  { ...mockUser, id: 'u1', username: 'TraderPro', email: 'trader@predictly.io', gold_balance: 50000, sweeps_balance: 2500, kyc_status: 'approved' as const, user_tier: 'gold' as const },
  { id: 'u2', email: 'whale@example.com', username: 'whale.eth', avatar_url: undefined, gold_balance: 120000, sweeps_balance: 8400, kyc_status: 'approved' as const, user_tier: 'diamond' as const, is_admin: false, created_at: '2025-02-10T10:00:00Z' },
  { id: 'u3', email: 'newbie@example.com', username: 'newkid', avatar_url: undefined, gold_balance: 1200, sweeps_balance: 75, kyc_status: 'pending' as const, user_tier: 'starter' as const, is_admin: false, created_at: '2026-01-15T14:00:00Z' },
  { id: 'u4', email: 'short@example.com', username: 'shortking', avatar_url: undefined, gold_balance: 8500, sweeps_balance: 320, kyc_status: 'approved' as const, user_tier: 'silver' as const, is_admin: false, created_at: '2025-06-20T08:00:00Z' },
  { id: 'u5', email: 'oracle@example.com', username: 'oracle9', avatar_url: undefined, gold_balance: 34000, sweeps_balance: 1900, kyc_status: 'approved' as const, user_tier: 'gold' as const, is_admin: false, created_at: '2025-03-01T12:00:00Z' },
  { id: 'u6', email: 'suspicious@example.com', username: 'sus_trader', avatar_url: undefined, gold_balance: 500, sweeps_balance: 25, kyc_status: 'rejected' as const, user_tier: 'starter' as const, is_admin: false, created_at: '2026-02-28T09:00:00Z' },
  { id: 'u7', email: 'macro@example.com', username: 'macro_dan', avatar_url: undefined, gold_balance: 22000, sweeps_balance: 1100, kyc_status: 'approved' as const, user_tier: 'gold' as const, is_admin: false, created_at: '2025-04-12T16:00:00Z' },
  { id: 'u8', email: 'pending@example.com', username: 'pending_kyc_user', avatar_url: undefined, gold_balance: 3000, sweeps_balance: 150, kyc_status: 'pending' as const, user_tier: 'bronze' as const, is_admin: false, created_at: '2026-03-01T11:00:00Z' },
]

export async function GET() {
  try {
    return NextResponse.json(mockUsers)
  } catch (error) {
    console.error('[Admin Users GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, username } = body

    if (!email || !username) {
      return NextResponse.json({ error: 'Email and username are required' }, { status: 400 })
    }

    const newUser = {
      id: `u${Date.now()}`,
      email,
      username,
      avatar_url: undefined,
      gold_balance: 0,
      sweeps_balance: 0,
      kyc_status: 'none' as const,
      user_tier: 'starter' as const,
      is_admin: false,
      created_at: new Date().toISOString(),
    }

    mockUsers.push(newUser)
    return NextResponse.json({ success: true, user: newUser })
  } catch (error) {
    console.error('[Admin Users POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
