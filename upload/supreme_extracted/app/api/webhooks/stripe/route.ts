import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-11-20.acacia' })
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    console.error('Webhook signature error:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'identity.verification_session.verified': {
      const session = event.data.object as Stripe.Identity.VerificationSession
      const userId = session.metadata?.user_id

      if (userId) {
        await supabaseAdmin
          .from('users')
          .update({
            kyc_status: 'verified',
            kyc_verified_at: new Date().toISOString(),
            kyc_document_url: session.metadata?.document_url || null,
          })
          .eq('id', userId)

        // Log the verification
        await supabaseAdmin.from('transactions').insert({
          user_id: userId,
          type: 'KYC_VERIFICATION',
          amount: 0,
          currency: 'USD',
          status: 'completed',
          metadata: { session_id: session.id },
        })
      }
      break
    }

    case 'identity.verification_session.redacted': {
      const session = event.data.object as Stripe.Identity.VerificationSession
      const userId = session.metadata?.user_id

      if (userId) {
        await supabaseAdmin
          .from('users')
          .update({ kyc_status: 'rejected' })
          .eq('id', userId)
      }
      break
    }

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.metadata?.user_id && session.metadata?.gc_amount) {
        const userId = session.metadata.user_id
        const gcAmount = parseInt(session.metadata.gc_amount)

        // Add gold coins to user
        const { error } = await supabaseAdmin.rpc('add_gold_coins', {
          p_user_id: userId,
          p_amount: gcAmount,
          p_reason: `Purchase: ${session.id}`,
        })

        if (!error) {
          // Log transaction
          await supabaseAdmin.from('transactions').insert({
            user_id: userId,
            type: 'PURCHASE',
            amount: gcAmount,
            currency: 'GOLD',
            status: 'completed',
            metadata: {
              session_id: session.id,
              usd_amount: session.amount_total / 100,
              package: session.metadata.package_name || 'custom',
            },
          })

          // Record purchase for referral tracking
          await supabaseAdmin.from('purchases').insert({
            user_id: userId,
            amount: session.amount_total / 100,
            gc_amount: gcAmount,
            stripe_session_id: session.id,
          })
        }
      }
      break
    }

    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent

      // Handle redemption payout
      if (pi.metadata?.type === 'redemption' && pi.metadata?.user_id) {
        await supabaseAdmin
          .from('transactions')
          .update({
            status: 'completed',
            metadata: { ...pi.metadata, stripe_payment_intent: pi.id },
          })
          .eq('metadata->>redemption_id', pi.metadata.redemption_id)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent

      if (pi.metadata?.type === 'redemption' && pi.metadata?.user_id) {
        await supabaseAdmin
          .from('transactions')
          .update({
            status: 'failed',
            metadata: { ...pi.metadata, failure_message: pi.last_payment_error?.message },
          })
          .eq('metadata->>redemption_id', pi.metadata.redemption_id)
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}