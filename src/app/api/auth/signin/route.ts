import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createHmac } from 'crypto'

const prisma = new PrismaClient()

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const verifyHash = createHmac('sha256', salt).update(password).digest('hex')
  return hash === verifyHash
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      // Log failed attempt
      await prisma.authLog.create({
        data: {
          email,
          action: 'FAILED_LOGIN',
          ip_address:
            request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          details: 'User not found or no password set',
        },
      })
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    if (!verifyPassword(password, user.passwordHash)) {
      await prisma.authLog.create({
        data: {
          user_id: user.id,
          email: user.email,
          action: 'FAILED_LOGIN',
          ip_address:
            request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          details: 'Incorrect password',
        },
      })
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if restricted
    if (user.isRestricted) {
      await prisma.authLog.create({
        data: {
          user_id: user.id,
          email: user.email,
          action: 'FAILED_LOGIN',
          details: 'Account restricted',
        },
      })
      return NextResponse.json(
        { error: 'Account is restricted. Please contact support.' },
        { status: 403 }
      )
    }

    // Log successful sign in
    await prisma.authLog.create({
      data: {
        user_id: user.id,
        email: user.email,
        action: 'SIGN_IN',
        ip_address:
          request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        details: 'Email login successful',
      },
    })

    // Return user data (without password hash)
    const { passwordHash: _, ...safeUser } = user
    return NextResponse.json({
      user: safeUser,
      message: 'Signed in successfully',
    })
  } catch (error: unknown) {
    console.error('[Auth] Signin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
