import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'status must be approved or rejected' }, { status: 400 })
    }

    // In demo mode, just return success
    return NextResponse.json({
      success: true,
      userId: id,
      kycStatus: status,
      notes: notes || '',
    })
  } catch (error) {
    console.error('[Admin User KYC] Error:', error)
    return NextResponse.json({ error: 'Failed to update KYC status' }, { status: 500 })
  }
}
