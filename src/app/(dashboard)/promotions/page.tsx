'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Tag, Gift, Mail, Copy, Check, Send, Star, Sparkles,
  Coins, Gem, ShieldCheck, Users, ArrowRight, CheckCircle2,
  Loader2, Clock,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { mockUser } from '@/lib/mockData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ── Mock Data ────────────────────────────────────────────────────────────────

const PROMO_OFFERS = [
  { id: 'welcome', title: 'Welcome Bonus', description: 'New users get 50,000 GC + 2,500 SC free', gc: 50000, sc: 2500, icon: '🎁', active: true },
  { id: 'daily-login', title: 'Daily Login Bonus', description: 'Log in daily for increasing SC rewards', gc: 1000, sc: 5, icon: '📅', active: true },
  { id: 'kyc-reward', title: 'KYC Verification Reward', description: 'Complete KYC verification and earn 25 SC', gc: 0, sc: 25, icon: '🛡️', active: true },
  { id: 'referral', title: 'Refer a Friend', description: 'Get 20 SC + 20,000 GC per depositing referral', gc: 20000, sc: 20, icon: '👥', active: true },
]

const MOCK_REDEEMED_CODES = [
  { id: 'r1', code: 'WELCOME2024', discount_type: 'FIXED_GC', discount_value: 50000, redeemed_at: '2026-03-01T10:00:00Z', status: 'APPLIED' },
  { id: 'r2', code: 'KYCBONUS25', discount_type: 'FIXED_SC', discount_value: 25, redeemed_at: '2026-02-15T14:30:00Z', status: 'APPLIED' },
  { id: 'r3', code: 'DAILYSTREAK', discount_type: 'FIXED_SC', discount_value: 5, redeemed_at: '2026-03-10T08:00:00Z', status: 'APPLIED' },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function PromotionsPage() {
  const [redeemCode, setRedeemCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; message: string } | null>(null)
  const [emailPromo, setEmailPromo] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [claimedOffers, setClaimedOffers] = useState<Set<string>>(new Set(['welcome']))
  const [copiedReferral, setCopiedReferral] = useState(false)

  const handleRedeem = async () => {
    if (!redeemCode.trim()) return
    setRedeeming(true)
    setRedeemResult(null)
    try {
      const res = await fetch('/api/auth/promo/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemCode.trim().toUpperCase(), userId: 'u1' }),
      })
      const data = await res.json()
      if (res.ok) {
        setRedeemResult({ success: true, message: data.message || 'Promo code redeemed successfully!' })
        setRedeemCode('')
      } else {
        setRedeemResult({ success: false, message: data.error || 'Failed to redeem promo code' })
      }
    } catch {
      setRedeemResult({ success: false, message: 'Network error. Please try again.' })
    } finally {
      setRedeeming(false)
    }
  }

  const handleEmailPromo = async () => {
    if (!emailPromo.trim() || !emailPromo.includes('@')) return
    setEmailSending(true)
    // Simulated email promo
    await new Promise((r) => setTimeout(r, 1500))
    setEmailSending(false)
    setEmailSent(true)
    setEmailPromo('')
    setTimeout(() => setEmailSent(false), 5000)
  }

  const handleClaimOffer = (offerId: string) => {
    setClaimedOffers((prev) => new Set(prev).add(offerId))
  }

  const copyReferral = () => {
    navigator.clipboard.writeText('https://predictly.io/r/TRADERPRO')
    setCopiedReferral(true)
    setTimeout(() => setCopiedReferral(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand/20 via-brand/10 to-yes/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-6 w-6 text-brand" />
                <h1 className="text-2xl sm:text-3xl font-bold">Promotions &amp; Bonuses</h1>
              </div>
              <p className="text-fg-muted text-sm max-w-lg">
                Claim bonus Gold Coins and Sweeps Coins through our promotional offers.
                Enter codes, complete tasks, and earn rewards.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gold-soft/50 border border-gold-border px-4 py-3 text-center">
                <div className="flex items-center gap-1.5 text-2xs text-gold mb-0.5">
                  <Coins className="h-3 w-3" /> Gold Coins
                </div>
                <div className="text-lg font-bold text-gold tabular-nums">{mockUser.gold_balance.toLocaleString()}</div>
              </div>
              <div className="rounded-xl bg-sweeps-soft/50 border border-sweeps-border px-4 py-3 text-center">
                <div className="flex items-center gap-1.5 text-2xs text-sweeps mb-0.5">
                  <Gem className="h-3 w-3" /> Sweeps Coins
                </div>
                <div className="text-lg font-bold text-sweeps tabular-nums">{mockUser.sweeps_balance.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Promotions Grid */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand" />
          Active Promotions
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {PROMO_OFFERS.map((offer) => {
            const claimed = claimedOffers.has(offer.id)
            return (
              <Card
                key={offer.id}
                className={cn(
                  'bg-bg-subtle border-border overflow-hidden transition-all hover:border-border-strong',
                  !offer.active && 'opacity-50'
                )}
              >
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="text-3xl shrink-0 mt-1">{offer.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{offer.title}</h3>
                        {offer.active && (
                          <Badge variant="secondary" className="bg-yes-soft text-yes border-yes-border text-2xs shrink-0">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xs text-fg-muted mb-3">{offer.description}</p>
                      <div className="flex items-center gap-3 mb-3">
                        {offer.gc > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold-soft/50 border border-gold-border text-xs font-semibold text-gold">
                            <Coins className="h-3 w-3" /> {offer.gc.toLocaleString()} GC
                          </span>
                        )}
                        {offer.sc > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sweeps-soft/50 border border-sweeps-border text-xs font-semibold text-sweeps">
                            <Gem className="h-3 w-3" /> {offer.sc.toLocaleString()} SC
                          </span>
                        )}
                      </div>
                      {offer.id === 'referral' ? (
                        <Link href="/referrals">
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            Refer Friends <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      ) : offer.id === 'kyc-reward' ? (
                        <Link href="/kyc">
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            Verify KYC <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          className={cn(
                            'h-8 text-xs',
                            claimed
                              ? 'bg-yes-soft text-yes hover:bg-yes-soft border-yes-border'
                              : 'bg-brand hover:bg-brand-hover text-white'
                          )}
                          disabled={claimed || !offer.active}
                          onClick={() => !claimed && handleClaimOffer(offer.id)}
                        >
                          {claimed ? (
                            <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Claimed</>
                          ) : (
                            <><Gift className="h-3.5 w-3.5 mr-1" /> Claim</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Redeem Code & Email Promo */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Redeem Code */}
        <Card className="bg-bg-subtle border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-brand" />
              Redeem Promo Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xs text-fg-muted">Have a promo code? Enter it below to claim your bonus.</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code..."
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                className="bg-bg border-border text-sm uppercase font-mono tracking-wider"
                maxLength={20}
              />
              <Button
                onClick={handleRedeem}
                disabled={redeeming || !redeemCode.trim()}
                className="bg-brand hover:bg-brand-hover text-white shrink-0"
              >
                {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Redeem'}
              </Button>
            </div>
            {redeemResult && (
              <div
                className={cn(
                  'rounded-lg px-3 py-2 text-xs font-medium',
                  redeemResult.success
                    ? 'bg-yes-soft/50 text-yes border border-yes-border'
                    : 'bg-no-soft/50 text-no border border-no-border'
                )}
              >
                {redeemResult.success ? <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" /> : null}
                {redeemResult.message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Promo */}
        <Card className="bg-bg-subtle border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand" />
              Email Promo Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xs text-fg-muted">Enter your email to receive exclusive promo codes and offers.</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={emailPromo}
                onChange={(e) => setEmailPromo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailPromo()}
                className="bg-bg border-border text-sm"
              />
              <Button
                onClick={handleEmailPromo}
                disabled={emailSending || !emailPromo.trim() || !emailPromo.includes('@')}
                className="bg-brand hover:bg-brand-hover text-white shrink-0"
              >
                {emailSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            {emailSent && (
              <div className="rounded-lg bg-yes-soft/50 text-yes border border-yes-border px-3 py-2 text-xs font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />
                Promo code sent to your email! Check your inbox.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Redeemed Codes */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-gold" />
          My Redeemed Codes
        </h2>
        <Card className="bg-bg-subtle border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-2xs text-fg-subtle uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Code</th>
                  <th className="text-left px-4 py-3 font-medium">Reward</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_REDEEMED_CODES.map((row) => (
                  <tr key={row.id} className="hover:bg-bg-elevated transition-colors">
                    <td className="px-4 py-3 font-mono text-brand text-xs tracking-wider">{row.code}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs font-semibold',
                        row.discount_type === 'FIXED_GC' ? 'text-gold' : 'text-sweeps'
                      )}>
                        {row.discount_type === 'FIXED_GC' ? (
                          <><Coins className="h-3 w-3" /> {row.discount_value.toLocaleString()} GC</>
                        ) : (
                          <><Gem className="h-3 w-3" /> {row.discount_value.toLocaleString()} SC</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-fg-muted tabular-nums text-xs">{formatDate(row.redeemed_at)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="bg-yes-soft text-yes border-yes-border text-2xs">
                        <CheckCircle2 className="h-3 w-3 mr-0.5" /> {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {MOCK_REDEEMED_CODES.length === 0 && (
            <div className="py-12 text-center">
              <Tag className="mx-auto h-10 w-10 text-fg-subtle opacity-40 mb-3" />
              <p className="text-sm text-fg-muted">No redeemed codes yet. Enter a promo code above!</p>
            </div>
          )}
        </Card>
      </section>

      {/* Referral Code Section */}
      <section>
        <Card className="bg-gradient-to-br from-brand/10 to-yes/10 border-brand/20 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <Gift className="h-5 w-5 text-brand" /> Your Referral Code
                </h2>
                <p className="text-2xs text-fg-muted mb-3">
                  Share your unique referral link and earn 50 SC + 20,000 GC for each friend who signs up and makes a deposit.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-2.5 rounded-lg bg-bg border border-border text-sm font-mono text-brand tracking-wider truncate">
                    predictly.io/r/TRADERPRO
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyReferral}
                    className="h-10 w-10 p-0 shrink-0"
                  >
                    {copiedReferral ? <Check className="h-4 w-4 text-yes" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-center gap-2 text-center px-6">
                <div className="h-16 w-16 rounded-full bg-brand-soft flex items-center justify-center">
                  <Users className="h-8 w-8 text-brand" />
                </div>
                <Link href="/referrals">
                  <Button variant="outline" size="sm" className="text-xs">
                    View Referrals <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
