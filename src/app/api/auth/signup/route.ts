import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createHmac, randomBytes } from 'crypto'

const prisma = new PrismaClient()

// Hash password with HMAC-SHA256
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = createHmac('sha256', salt).update(password).digest('hex')
  return `${salt}:${hash}`
}

// Generate a unique referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'PRED-'
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username, referralCode } = body

    // Validation
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, password, and username are required' },
        { status: 400 }
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }
    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Check if username already exists
    const existingHandle = await prisma.user.findUnique({ where: { handle: username } })
    if (existingHandle) {
      return NextResponse.json(
        { error: 'This username is already taken' },
        { status: 409 }
      )
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        handle: username,
        name: username,
        passwordHash: hashPassword(password),
        authProvider: 'email',
        gcBalance: 50000, // Welcome bonus
        scBalance: 2500, // Free SC on signup
        userTier: 'bronze',
        ageVerified: true,
        referralCode: generateReferralCode(),
        referredByCode: referralCode || null,
      },
    })

    // If referral code provided, find the referrer
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      })
      if (referrer) {
        // Create referral record
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            referralCode: referralCode,
            status: 'pending',
            rewardSc: 20,
            rewardGold: 20000,
          },
        })
      }
    }

    // Log the signup
    await prisma.authLog.create({
      data: {
        user_id: user.id,
        email: user.email,
        action: 'SIGN_UP',
        ip_address:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        details: 'Email signup',
      },
    })

    // Create welcome bonus transactions
    await prisma.transaction.createMany({
      data: [
        {
          userId: user.id,
          type: 'SC_BONUS',
          amount: 2500,
          currency: 'SC',
          description: 'Welcome bonus - Free Sweeps Coins',
          status: 'completed',
        },
        {
          userId: user.id,
          type: 'GC_PURCHASE',
          amount: 50000,
          currency: 'GC',
          description: 'Welcome bonus - Free Gold Coins',
          status: 'completed',
        },
      ],
    })

    // Return user data (without password hash)
    const { passwordHash: _, ...safeUser } = user
    return NextResponse.json(
      {
        user: safeUser,
        message: 'Account created successfully!',
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('[Auth] Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
