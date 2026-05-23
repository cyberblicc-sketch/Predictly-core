import { NextResponse } from 'next/server'

// In-memory config for demo purposes
let siteConfig = {
  siteName: 'Predictly',
  maintenanceMode: false,
  announcementBanner: '',
  houseFee: 0.02,
  platformFee: 0.01,
  exitFee: 0.01,
  minRedemptionGC: 1000,
  minRedemptionSC: 50,
  kycProvider: 'stripe',
  kycAutoApprove: false,
  kycRequiredDocuments: ['government_id', 'selfie', 'proof_of_address'],
}

export async function GET() {
  try {
    return NextResponse.json(siteConfig)
  } catch (error) {
    console.error('[Admin Config GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    siteConfig = { ...siteConfig, ...body }
    return NextResponse.json({ success: true, config: siteConfig })
  } catch (error) {
    console.error('[Admin Config POST] Error:', error)
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
  }
}
