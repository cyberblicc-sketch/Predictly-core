import { NextResponse } from 'next/server'

// In-memory AI config for demo purposes
let aiEnabled = true

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { enabled } = body

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 })
    }

    aiEnabled = enabled
    return NextResponse.json({ success: true, enabled: aiEnabled })
  } catch (error) {
    console.error('[AI Toggle] Error:', error)
    return NextResponse.json({ error: 'Failed to toggle AI swarm' }, { status: 500 })
  }
}
