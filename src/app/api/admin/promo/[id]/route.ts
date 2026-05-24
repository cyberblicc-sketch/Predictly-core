import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const promo = await db.promoCode.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ promo })
  } catch (error) {
    console.error('[Admin Promo] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update promo code' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Soft delete - just deactivate
    const promo = await db.promoCode.update({
      where: { id },
      data: { is_active: false },
    })
    return NextResponse.json({ promo })
  } catch (error) {
    console.error('[Admin Promo] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to deactivate promo code' }, { status: 500 })
  }
}
