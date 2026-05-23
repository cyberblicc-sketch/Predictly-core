import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, address, dateOfBirth } = body

    if (!fullName || !email || !address || !dateOfBirth) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check age
    const dob = new Date(dateOfBirth)
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    if (age < 18) {
      return NextResponse.json({ error: 'You must be at least 18 years old' }, { status: 400 })
    }

    // Create or find user by email
    let user = await db.user.findUnique({ where: { email } })
    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: fullName,
          authProvider: 'amoe',
          gcBalance: 5000,
          scBalance: 50,
          ageVerified: true,
        },
      })
    }

    // Check if user already submitted an AMOE entry today (limit 1 per day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const existingToday = await db.amoeEntry.findFirst({
      where: {
        email,
        receivedAt: { gte: today },
      },
    })
    if (existingToday) {
      return NextResponse.json({
        error: 'You have already submitted an AMOE entry today. Please try again tomorrow.',
      }, { status: 429 })
    }

    // Create AMOE entry
    const entry = await db.amoeEntry.create({
      data: {
        fullName,
        email,
        address,
        dateOfBirth: dob,
        userId: user.id,
        scCredited: 50,
        processed: true,
        processedAt: new Date(),
      },
    })

    // Credit SC
    await db.user.update({
      where: { id: user.id },
      data: { scBalance: { increment: 50 } },
    })

    await db.transaction.create({
      data: {
        userId: user.id,
        type: 'SC_BONUS',
        amount: 50,
        currency: 'SC',
        description: 'AMOE entry — Free Sweeps Coins',
        status: 'completed',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'AMOE entry received! 50 SC credited to your account.',
      scCredited: 50,
    })
  } catch (error) {
    console.error('[AMOE] Error:', error)
    return NextResponse.json({ error: 'Failed to process entry' }, { status: 500 })
  }
}
