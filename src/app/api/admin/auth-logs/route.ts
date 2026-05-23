import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const action = url.searchParams.get('action')

    const where: any = {}
    if (action) where.action = action

    const logs = await db.authLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await db.authLog.count({ where })

    return NextResponse.json({ logs, total })
  } catch (error) {
    console.error('[Admin Auth Logs] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch auth logs' }, { status: 500 })
  }
}
