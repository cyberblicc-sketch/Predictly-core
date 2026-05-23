import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Check for session cookie
    const sessionCookie = request.cookies.get('predictly_session')
    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null })
    }

    // Parse session (format: userId:timestamp:signature)
    const session = sessionCookie.value
    const userId = session.split(':')[0]
    if (!userId) {
      return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ user: null })
    }

    const { passwordHash: _, ...safeUser } = user
    return NextResponse.json({ user: safeUser })
  } catch (error: unknown) {
    console.error('[Auth] Me error:', error)
    return NextResponse.json({ user: null })
  }
}
