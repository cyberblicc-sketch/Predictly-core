import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, userId } = body

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Code and user ID are required' },
        { status: 400 }
      )
    }

    // Find the promo code
    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    })
    if (!promo) {
      return NextResponse.json(
        { error: 'Invalid promotion code' },
        { status: 404 }
      )
    }

    // Check if active
    if (!promo.is_active) {
      return NextResponse.json(
        { error: 'This promotion code is no longer active' },
        { status: 400 }
      )
    }

    // Check expiry
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This promotion code has expired' },
        { status: 400 }
      )
    }

    // Check redemption limit
    if (promo.current_redemptions >= promo.max_redemptions) {
      return NextResponse.json(
        { error: 'This promotion code has reached its maximum redemptions' },
        { status: 400 }
      )
    }

    // Check if user already redeemed
    const existingRedemption = await prisma.promoRedemption.findUnique({
      where: {
        user_id_promo_code_id: {
          user_id: userId,
          promo_code_id: promo.id,
        },
      },
    })
    if (existingRedemption) {
      return NextResponse.json(
        { error: 'You have already redeemed this promotion code' },
        { status: 400 }
      )
    }

    // Process the redemption
    let bonusGc = 0
    let bonusSc = 0
    let discountDesc = ''

    switch (promo.discount_type) {
      case 'FIXED_GC':
        bonusGc = promo.discount_value
        discountDesc = `${promo.discount_value.toLocaleString()} GC bonus`
        break
      case 'FIXED_SC':
        bonusSc = promo.discount_value
        discountDesc = `${promo.discount_value.toLocaleString()} SC bonus`
        break
      case 'PERCENTAGE':
        // Percentage discount on next purchase (tracked but not applied here)
        discountDesc = `${promo.discount_value}% discount on next purchase`
        break
    }

    // Update user balance
    if (bonusGc > 0 || bonusSc > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          gcBalance: { increment: bonusGc },
          scBalance: { increment: bonusSc },
        },
      })

      // Create transaction records
      if (bonusSc > 0) {
        await prisma.transaction.create({
          data: {
            userId,
            type: 'SC_BONUS',
            amount: bonusSc,
            currency: 'SC',
            description: `Promo code redeemed: ${promo.code} — ${discountDesc}`,
            status: 'completed',
          },
        })
      }
      if (bonusGc > 0) {
        await prisma.transaction.create({
          data: {
            userId,
            type: 'GC_PURCHASE',
            amount: bonusGc,
            currency: 'GC',
            description: `Promo code redeemed: ${promo.code} — ${discountDesc}`,
            status: 'completed',
          },
        })
      }
    }

    // Record the redemption
    await prisma.promoRedemption.create({
      data: {
        user_id: userId,
        promo_code_id: promo.id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
      },
    })

    // Increment redemption count
    await prisma.promoCode.update({
      where: { id: promo.id },
      data: { current_redemptions: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      message: `Promo code redeemed! ${discountDesc}`,
      bonusGc,
      bonusSc,
      discountType: promo.discount_type,
      discountValue: promo.discount_value,
    })
  } catch (error: unknown) {
    console.error('[Auth] Promo redeem error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
