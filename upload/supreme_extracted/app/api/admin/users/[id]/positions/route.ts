import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const { data, error } = await supabaseAdmin
      .from('positions')
      .select(`
        *,
        markets(id, question, status, current_probability)
      `)
      .eq('user_id', id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const positions = (data || []).map(pos => ({
      id: pos.id,
      market_id: pos.market_id,
      side: pos.side,
      stake: pos.stake,
      entry_prob: pos.entry_price,
      is_settled: pos.is_settled,
      pnl: pos.pnl,
      current_value: pos.current_value,
      markets: pos.markets ? {
        question: pos.markets.question,
        status: pos.markets.status,
        current_probability: pos.markets.current_probability,
      } : null,
      created_at: pos.created_at,
    }))

    return NextResponse.json({ positions })
  } catch (error) {
    console.error('User positions error:', error)
    return NextResponse.json({ error: 'Failed to load positions' }, { status: 500 })
  }
}