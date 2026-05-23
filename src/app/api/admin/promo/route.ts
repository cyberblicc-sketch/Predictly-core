import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: List all promo codes
export async function GET(request: NextRequest) {
  try {
    const codes = await db.promoCode.findMany({
      orderBy: { created_at: 'desc' },
    })

    // Get redemption counts
    const codesWithCount = await Promise.all(
      codes.map(async (code) => {
        const redemptions = await db.promoRedemption.findMany({
          where: { promo_code_id: code.id },
        })
        return { ...code, redemptions }
      })
    )

    return NextResponse.json({ codes: codesWithCount })
  } catch (error) {
    console.error('[Admin Promo] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 })
  }
}

// POST: Create a new promo code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, description, discount_type, discount_value, max_redemptions, expires_at } = body

    if (!code || !discount_type || !discount_value) {
      return NextResponse.json(
        { error: 'Code, type, and value are required' },
        { status: 400 }
      )
    }

    const promo = await db.promoCode.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        discount_type,
        discount_value: parseInt(discount_value),
        max_redemptions: parseInt(max_redemptions) || 100,
        expires_at: expires_at ? new Date(expires_at) : null,
        is_active: true,
        created_by: 'admin',
      },
    })

    return NextResponse.json({ promo }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A promo code with this name already exists' },
        { status: 409 }
      )
    }
    console.error('[Admin Promo] POST error:', error)
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 })
  }
}
