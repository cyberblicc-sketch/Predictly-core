import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function GET() {
  try {
    const isAdmin = await verifyAdminSession()
    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error('[Admin Check] Error:', error)
    return NextResponse.json({ isAdmin: false })
  }
}
