import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'
import { markets } from '@/lib/mockData'
import {
  checkPoolSolvency,
  calculateRedemptionPriority,
  calculateReserveAllocation,
  generatePlatformSolvencyReport,
  generateRebalancingRecommendations,
  processRedemptionQueue,
} from '@/lib/pool-solvency'

export async function GET() {
  const isAuthorized = await verifyAdminSession()
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const report = generatePlatformSolvencyReport(markets)
    const rebalancing = generateRebalancingRecommendations(markets)
    const solvencyChecks = markets.map(m => checkPoolSolvency(m))
    const reserves = markets.map(m => calculateReserveAllocation(m))

    // Mock redemption queue
    const mockRedemptions = [
      { id: 'r1', user_id: 'u1', market_id: 'm-btc-200k', amount: 500, requested_at: new Date().toISOString() },
      { id: 'r2', user_id: 'u2', market_id: 'm-election-2028', amount: 1200, requested_at: new Date().toISOString() },
      { id: 'r3', user_id: 'u3', market_id: 'm-superbowl', amount: 350, requested_at: new Date().toISOString() },
      { id: 'r4', user_id: 'u4', market_id: 'm-fed-cut-jun', amount: 800, requested_at: new Date().toISOString() },
      { id: 'r5', user_id: 'u5', market_id: 'm-ukraine-ceasefire', amount: 2000, requested_at: new Date().toISOString() },
    ]
    const queue = processRedemptionQueue(mockRedemptions, markets)

    return NextResponse.json({
      report,
      rebalancing,
      solvencyChecks,
      reserves,
      redemptionQueue: queue,
    })
  } catch (err) {
    console.error('[Pool Solvency API] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
