import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminAuth } from '@/lib/adminAuth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authResult = await verifyAdminAuth(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    let query = supabaseAdmin
      .from('markets')
      .select(`
        *,
        creator:users!creator_id(email, handle)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      markets: data || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Markets fetch error:', error)
    return NextResponse.json({ error: 'Failed to load markets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResult = await verifyAdminAuth(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, category, question, outcome_type, closes_at, resolves_at } = body

  if (!title || !question) {
    return NextResponse.json({ error: 'Title and question are required' }, { status: 400 })
  }

  try {
    // Generate market ID
    const marketId = `mkt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

    // Create market using RPC
    const { data, error } = await supabaseAdmin.rpc('create_market', {
      p_market_id: marketId,
      p_title: title,
      p_description: description || '',
      p_category: category || 'events',
      p_question: question,
      p_outcome_type: outcome_type || 'binary',
      p_creator_id: authResult.adminId,
      p_closes_at: closes_at || null,
      p_resolves_at: resolves_at || null,
      p_initial_liquidity: body.initial_liquidity || 10000,
    })

    if (error) throw error

    // Log admin action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: authResult.adminId,
      action: 'MARKET_CREATE',
      target_market_id: marketId,
      changes: { title, category, question },
      reason: body.reason || 'Market created via admin panel',
    })

    return NextResponse.json({
      success: true,
      market_id: marketId,
      market: data,
    })
  } catch (error) {
    console.error('Market creation error:', error)
    return NextResponse.json({ error: 'Failed to create market' }, { status: 500 })
  }
}