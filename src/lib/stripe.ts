// ============================================================================
// Predictly — Stripe integration
// GC purchases, identity verification, redemption payouts, webhooks
// ============================================================================

import Stripe from 'stripe'
import type { GCPackages, GCPackageId } from '@/types'
import { GC_PACKAGES } from './mockData'

// ── Stripe Client ────────────────────────────────────────────────────────────

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? ''

function getStripeClient(): Stripe | null {
  if (!STRIPE_SECRET_KEY) {
    console.warn('[Stripe] STRIPE_SECRET_KEY not set — payment features disabled')
    return null
  }
  try {
    return new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
    })
  } catch (err) {
    console.error('[Stripe] Failed to initialize client:', err)
    return null
  }
}

// ── GC Packages ──────────────────────────────────────────────────────────────

export { GC_PACKAGES }

export const GC_PACKAGE_LIST: {
  id: GCPackageId
  label: string
  gc: number
  scBonus: number
  priceCents: number
  popular?: boolean
}[] = [
  { id: 'starter',  label: 'Starter',  gc: 1_000,   scBonus: 5,   priceCents: 499,   popular: false },
  { id: 'bronze',   label: 'Bronze',   gc: 5_000,   scBonus: 25,  priceCents: 1_999,  popular: false },
  { id: 'silver',   label: 'Silver',   gc: 15_000,  scBonus: 75,  priceCents: 4_999,  popular: true },
  { id: 'gold',     label: 'Gold',     gc: 40_000,  scBonus: 200, priceCents: 9_999,  popular: false },
  { id: 'diamond',  label: 'Diamond',  gc: 100_000, scBonus: 500, priceCents: 24_999, popular: false },
]

// ── Checkout Session ─────────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout session for a GC package purchase.
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  packageId: GCPackageId,
  successUrl: string,
  cancelUrl: string
): Promise<string | null> {
  const stripe = getStripeClient()
  if (!stripe) return null

  const pkg = GC_PACKAGES[packageId]
  if (!pkg) throw new Error(`Invalid package ID: ${packageId}`)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: pkg.price,
            product_data: {
              name: `${pkg.gc.toLocaleString()} Gold Coins + ${pkg.sc_bonus} Sweeps Coins`,
              description: `Predictly ${packageId.charAt(0).toUpperCase() + packageId.slice(1)} package`,
              metadata: {
                package_id: packageId,
                gc_amount: String(pkg.gc),
                sc_bonus: String(pkg.sc_bonus),
              },
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
        package_id: packageId,
        gc_amount: String(pkg.gc),
        sc_bonus: String(pkg.sc_bonus),
      },
    })

    return session.url
  } catch (err) {
    console.error('[Stripe] createCheckoutSession failed:', err)
    return null
  }
}

// ── Identity Verification ────────────────────────────────────────────────────

/**
 * Create a Stripe Identity verification session for KYC.
 */
export async function createIdentityVerificationSession(
  userId: string,
  returnUrl: string
): Promise<string | null> {
  const stripe = getStripeClient()
  if (!stripe) return null

  try {
    const session = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        user_id: userId,
      },
      options: {
        document: {
          allowed_types: ['driving_license', 'passport', 'id_card'],
          require_id_number: true,
          require_selfie: true,
        },
      },
      return_url: returnUrl,
    })

    return session.url
  } catch (err) {
    console.error('[Stripe] createIdentityVerificationSession failed:', err)
    return null
  }
}

// ── Redemption Payout ────────────────────────────────────────────────────────

/**
 * Create a Stripe payout for SC redemption (ACH transfer).
 */
export async function createRedemptionPayout(
  userId: string,
  amountCents: number,
  destination: string // Bank account or Stripe Connect destination
): Promise<string | null> {
  const stripe = getStripeClient()
  if (!stripe) return null

  try {
    const payout = await stripe.payouts.create({
      amount: amountCents,
      currency: 'usd',
      method: 'standard',
      destination,
      metadata: {
        user_id: userId,
        type: 'sc_redemption',
      },
    })

    return payout.id
  } catch (err) {
    console.error('[Stripe] createRedemptionPayout failed:', err)
    return null
  }
}

// ── Webhook Handler ──────────────────────────────────────────────────────────

/**
 * Handle incoming Stripe webhook events.
 * Processes: checkout.session.completed, identity.verification_session.verified,
 *            payout.paid, payout.failed
 */
export async function handleStripeWebhook(
  body: string,
  signature: string
): Promise<{ received: boolean; event?: string }> {
  const stripe = getStripeClient()
  if (!stripe) return { received: false }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''
  if (!webhookSecret) {
    console.error('[Stripe] STRIPE_WEBHOOK_SECRET not set')
    return { received: false }
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const packageId = session.metadata?.package_id as GCPackageId | undefined
        if (userId && packageId) {
          await creditUserAccount(userId, packageId)
        }
        break
      }

      case 'identity.verification_session.verified': {
        const session = event.data.object as Stripe.Identity.VerificationSession
        const userId = session.metadata?.user_id
        if (userId) {
          await updateKycStatus(userId, 'approved')
        }
        break
      }

      case 'identity.verification_session.requires_input': {
        const session = event.data.object as Stripe.Identity.VerificationSession
        const userId = session.metadata?.user_id
        if (userId) {
          await updateKycStatus(userId, 'rejected')
        }
        break
      }

      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout
        console.log(`[Stripe] Payout succeeded: ${payout.id} for user ${payout.metadata?.user_id}`)
        break
      }

      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout
        console.error(`[Stripe] Payout failed: ${payout.id} for user ${payout.metadata?.user_id}`)
        break
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`)
    }

    return { received: true, event: event.type }
  } catch (err) {
    console.error('[Stripe] Webhook verification failed:', err)
    return { received: false }
  }
}

// ── Helper: Credit User Account ──────────────────────────────────────────────

/**
 * Credit a user's account with GC and SC bonus after a successful purchase.
 * In production, this calls a Supabase RPC function for atomic balance updates.
 */
async function creditUserAccount(userId: string, packageId: GCPackageId): Promise<void> {
  const pkg = GC_PACKAGES[packageId]
  if (!pkg) {
    console.error(`[Stripe] Invalid package ID: ${packageId}`)
    return
  }

  try {
    // Attempt to call Supabase RPC
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.log(`[Stripe] Demo mode: would credit user ${userId} with ${pkg.gc} GC + ${pkg.sc_bonus} SC`)
      return
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/credit_user_purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        p_user_id: userId,
        p_gc_amount: pkg.gc,
        p_sc_bonus: pkg.sc_bonus,
        p_package_id: packageId,
      }),
    })

    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.status} ${response.statusText}`)
    }

    console.log(`[Stripe] Credited user ${userId}: ${pkg.gc} GC + ${pkg.sc_bonus} SC`)
  } catch (err) {
    console.error('[Stripe] creditUserAccount failed:', err)
  }
}

// ── Helper: Update KYC Status ────────────────────────────────────────────────

/**
 * Update a user's KYC status after identity verification.
 * In production, this calls a Supabase RPC function.
 */
async function updateKycStatus(
  userId: string,
  status: 'approved' | 'rejected' | 'pending'
): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.log(`[Stripe] Demo mode: would update KYC status for user ${userId} to ${status}`)
      return
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/update_kyc_status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        p_user_id: userId,
        p_status: status,
      }),
    })

    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.status} ${response.statusText}`)
    }

    console.log(`[Stripe] Updated KYC status for user ${userId}: ${status}`)
  } catch (err) {
    console.error('[Stripe] updateKycStatus failed:', err)
  }
}
