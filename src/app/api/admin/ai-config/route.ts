import { NextResponse } from 'next/server'

// In-memory AI config for demo purposes
let aiConfig = {
  enabled: true,
  agents: {
    momentum: { enabled: true, confidenceThreshold: 0.65, dailyLimit: 5000 },
    contrarian: { enabled: true, confidenceThreshold: 0.70, dailyLimit: 3000 },
    arbitrage: { enabled: true, confidenceThreshold: 0.80, dailyLimit: 2000 },
    sentiment: { enabled: true, confidenceThreshold: 0.60, dailyLimit: 4000 },
  },
  globalDailyLimit: 15000,
}

export async function GET() {
  try {
    return NextResponse.json(aiConfig)
  } catch (error) {
    console.error('[AI Config GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch AI config' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    aiConfig = { ...aiConfig, ...body }
    return NextResponse.json({ success: true, config: aiConfig })
  } catch (error) {
    console.error('[AI Config POST] Error:', error)
    return NextResponse.json({ error: 'Failed to update AI config' }, { status: 500 })
  }
}
