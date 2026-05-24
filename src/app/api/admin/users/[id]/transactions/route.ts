import { NextResponse } from 'next/server'
import { transactions } from '@/lib/mockData'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userTransactions = transactions.filter(t => t.userId === id)
    return NextResponse.json(userTransactions)
  } catch (error) {
    console.error('[Admin User Transactions] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
