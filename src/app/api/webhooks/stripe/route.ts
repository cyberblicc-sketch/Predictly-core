import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // In demo mode, just acknowledge the webhook
    // In production, you would:
    // 1. Verify the Stripe signature from the `Stripe-Signature` header
    // 2. Parse the event type
    // 3. Handle specific event types:
    //    - checkout.session.completed: Fulfill GC purchase
    //    - identity.verification_session.verified: Approve KYC
    //    - identity.verification_session.requires_input: Notify user

    const eventType = body?.type || 'unknown'
    console.log(`[Stripe Webhook] Received event: ${eventType}`)

    switch (eventType) {
      case 'checkout.session.completed': {
        const session = body?.data?.object
        console.log('[Stripe Webhook] Checkout completed:', session?.id)
        // In production: Update user balance based on GC package purchased
        break
      }
      case 'identity.verification_session.verified': {
        const session = body?.data?.object
        console.log('[Stripe Webhook] Identity verified:', session?.id)
        // In production: Update user KYC status to approved
        break
      }
      case 'identity.verification_session.requires_input': {
        const session = body?.data?.object
        console.log('[Stripe Webhook] Identity requires input:', session?.id)
        // In production: Notify user to provide additional documents
        break
      }
      default:
        console.log('[Stripe Webhook] Unhandled event type:', eventType)
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error)
    // Still return 200 to prevent Stripe retries
    return NextResponse.json({ received: true })
  }
}
