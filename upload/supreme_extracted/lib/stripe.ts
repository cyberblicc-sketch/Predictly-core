import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// GC Package definitions
export const GC_PACKAGES = {
  starter: { gc: 1000, sc_bonus: 5, price: 499 },
  bronze: { gc: 5000, sc_bonus: 25, price: 1999 },
  silver: { gc: 15000, sc_bonus: 75, price: 4999 },
  gold: { gc: 40000, sc_bonus: 200, price: 9999 },
  diamond: { gc: 100000, sc_bonus: 500, price: 24999 }
} as const

export type GCPackageId = keyof typeof GC_PACKAGES

/**
 * Create a Stripe checkout session for GC package purchase
 */
export async function createCheckoutSession(userId: string, packageId: string) {
  const pkg = GC_PACKAGES[packageId as GCPackageId]
  if (!pkg) throw new Error('Invalid package')

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${pkg.gc.toLocaleString()} Gold Coins`,
          description: `Includes ${pkg.sc_bonus} Sweeps Coins bonus`
        },
        unit_amount: pkg.price
      },
      quantity: 1
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/rewards?success=true&package=${packageId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/rewards?cancelled=true`,
    metadata: { userId, packageId, gc_amount: pkg.gc.toString(), sc_bonus: pkg.sc_bonus.toString() }
  })

  return session
}

/**
 * Create a Stripe Identity verification session for KYC
 */
export async function createIdentityVerificationSession(userId: string) {
  const session = await stripe.identity.verificationSessions.create({
    type: 'document',
    metadata: { userId }
  })
  return session
}

/**
 * Create a Stripe payout for redemption
 */
export async function createRedemptionPayout(userId: string, amount: number, method: 'ach' | 'check' | 'paypal') {
  // Get user's stripe customer ID
  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (!user?.stripe_customer_id) {
    throw new Error('No Stripe customer ID found')
  }

  // Create a payout (this would need proper implementation with Stripe Connect
  // or similar for actual payout processing)
  const payout = await stripe.payouts.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    metadata: { userId }
  })

  return payout
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(signature: string, payload: Buffer) {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      // Credit user account with GC and SC
      const session = event.data.object as Stripe.Checkout.Session
      const { userId, gc_amount, sc_bonus } = session.metadata as { userId: string; gc_amount: string; sc_bonus: string }
      
      if (userId && gc_amount && sc_bonus) {
        await creditUserAccount(userId, parseInt(gc_amount), parseInt(sc_bonus))
      }
      break
    }
    case 'identity.verification_session.verified': {
      // Update user KYC status to verified
      const verificationSession = event.data.object as Stripe.Identity.VerificationSession
      const userId = verificationSession.metadata?.userId
      if (userId) {
        await updateKycStatus(userId, 'verified')
      }
      break
    }
    case 'identity.verification_session.requires_input': {
      // KYC needs more info
      const verificationSession = event.data.object as Stripe.Identity.VerificationSession
      const userId = verificationSession.metadata?.userId
      if (userId) {
        await updateKycStatus(userId, 'pending')
      }
      break
    }
    case 'identity.verification_session.requires_documents': {
      // KYC documents needed
      const verificationSession = event.data.object as Stripe.Identity.VerificationSession
      const userId = verificationSession.metadata?.userId
      if (userId) {
        await updateKycStatus(userId, 'pending')
      }
      break
    }
  }
  return { received: true }
}

/**
 * Credit user account with GC and SC from package purchase
 */
async function creditUserAccount(userId: string, gcAmount: number, scBonus: number) {
  // Get current balances
  const { data: user } = await supabase
    .from('users')
    .select('gc_balance, sc_balance')
    .eq('id', userId)
    .single()

  if (!user) throw new Error('User not found')

  const newGcBalance = user.gc_balance + gcAmount
  const newScBalance = user.sc_balance + scBonus

  // Update balances
  await supabase
    .from('users')
    .update({ gc_balance: newGcBalance, sc_balance: newScBalance })
    .eq('id', userId)

  // Create transaction records
  const gcTxPromise = supabase.from('transactions').insert({
    user_id: userId,
    type: 'GC_PURCHASE',
    amount: gcAmount,
    currency: 'gc',
    balance_before: user.gc_balance,
    balance_after: newGcBalance,
    status: 'completed',
    description: `Purchased ${gcAmount.toLocaleString()} Gold Coins`
  })

  const scTxPromise = supabase.from('transactions').insert({
    user_id: userId,
    type: 'SC_BONUS_WITH_GC',
    amount: scBonus,
    currency: 'sc',
    balance_before: user.sc_balance,
    balance_after: newScBalance,
    status: 'completed',
    description: `Sweeps Coins bonus with Gold Coins purchase`
  })

  await Promise.all([gcTxPromise, scTxPromise])
}

/**
 * Update user KYC status
 */
async function updateKycStatus(userId: string, status: 'verified' | 'pending' | 'rejected') {
  const updates: Record<string, unknown> = { kyc_status: status }
  
  if (status === 'verified') {
    updates.kyc_verified_at = new Date().toISOString()
  }

  await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)

  // Create KYC request record
  await supabase.from('kyc_requests').insert({
    user_id: userId,
    status,
    notes: `Stripe Identity verification ${status}`
  })
}

// Import supabase for database operations
import { supabase } from './supabase'