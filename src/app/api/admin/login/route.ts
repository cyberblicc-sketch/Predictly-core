import { NextResponse } from 'next/server'
import { createAdminSession } from '@/lib/adminAuth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'predictly-admin-2026'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    await createAdminSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin Login] Error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
