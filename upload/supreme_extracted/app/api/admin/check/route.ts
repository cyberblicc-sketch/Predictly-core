import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { verifyAdminAuth } from '@/lib/adminAuth'

export async function GET() {
  try {
    // Check for admin token in cookies
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('sb-admin-token')?.value

    if (!adminToken) {
      return NextResponse.json({ isAdmin: false })
    }

    // Verify the token
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(adminToken)

    if (error || !user) {
      return NextResponse.json({ isAdmin: false })
    }

    // Check if user is admin
    const isAdmin = user.app_metadata?.claims?.admin === true ||
                    user.user_metadata?.is_admin === true ||
                    user.email === process.env.ADMIN_EMAIL

    return NextResponse.json({ isAdmin: !!isAdmin, userId: user.id })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json({ isAdmin: false })
  }
}