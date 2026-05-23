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
      .from('transactions')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    const transactions = (data || []).map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      balance_before: tx.metadata?.balance_before || 0,
      balance_after: tx.metadata?.balance_after || 0,
      description: tx.metadata?.description || tx.type,
      status: tx.status,
      created_at: tx.created_at,
    }))

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('User transactions error:', error)
    return NextResponse.json({ error: 'Failed to load transactions' }, { status: 500 })
  }
}