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
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'created_at'
  const direction = searchParams.get('direction') || 'desc'

  try {
    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .order(sort as any, { ascending: direction === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    if (search) {
      query = query.or(`email.ilike.%${search}%,handle.ilike.%${search}%,name.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    const users = (data || []).map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      handle: u.handle,
      kyc_status: u.kyc_status,
      gc_balance: u.gc_balance || 0,
      sc_balance: u.sc_balance || 0,
      user_tier: u.user_tier || 'bronze',
      is_admin: u.is_admin || false,
      is_publisher: u.is_publisher || false,
      is_restricted: u.is_restricted || false,
      created_at: u.created_at,
    }))

    return NextResponse.json({
      users,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}