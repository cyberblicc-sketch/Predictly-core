import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (userId) {
      await prisma.authLog.create({
        data: {
          user_id: userId,
          action: 'SIGN_OUT',
          details: 'User signed out',
        },
      })
    }
    return NextResponse.json({ message: 'Signed out successfully' })
  } catch (error: unknown) {
    console.error('[Auth] Signout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
