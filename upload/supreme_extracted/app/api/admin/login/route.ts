import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    // Get hashed admin password from env
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

    if (!adminPasswordHash) {
      // First time setup - create hash from ADMIN_PASSWORD
      const adminPassword = process.env.ADMIN_PASSWORD
      if (!adminPassword) {
        return NextResponse.json({ error: 'Admin not configured' }, { status: 500 })
      }
      // Hash the password for future comparisons
      const hash = await bcrypt.hash(adminPassword, 10)
      // Store in env (in production, use a proper secrets manager)
      process.env.ADMIN_PASSWORD_HASH = hash

      // Verify against the plain password initially
      if (password !== adminPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      }

      // Create session
      const cookieStore = await cookies()
      const { data: { session }, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: 'admin@supremefusion.local',
      })

      if (error || !session) {
        // Fallback: generate a simple token
        const token = Buffer.from(`${Date.now()}:${Math.random()}`).toString('base64')
        cookieStore.set('sb-admin-token', token, {
          path: '/',
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        })
        cookieStore.set('sb-access-token', token, {
          path: '/admin',
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7,
        })

        return NextResponse.json({ success: true, token })
      }

      cookieStore.set('sb-admin-token', session.access_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
      })
      cookieStore.set('sb-access-token', session.access_token, {
        path: '/admin',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
      })

      return NextResponse.json({ success: true, token: session.access_token })
    }

    // Verify against stored hash
    const valid = await bcrypt.compare(password, adminPasswordHash)

    if (!valid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Generate admin session token
    const token = Buffer.from(`${Date.now()}:${Math.random()}:admin`).toString('base64')

    // Store tokens in cookies
    const cookieStore = await cookies()
    cookieStore.set('sb-admin-token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    cookieStore.set('sb-access-token', token, {
      path: '/admin',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}