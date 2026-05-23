'use client'

import { useState } from 'react'
import {
  Copy, Check, Share2, Gift, Users, Coins, Clock,
  Twitter, Mail, MessageCircle, ChevronRight,
} from 'lucide-react'
import { cn, formatDate, formatUSD } from '@/lib/utils'

const REFERRAL_CODE = 'PREDICTLY-TRADERPRO-2024'
const REFERRAL_LINK = 'https://predictly.io/r/TRADERPRO'

const MOCK_REFERRALS = [
  { id: 'r1', username: 'CryptoNewbie', date: '2026-03-08T10:00:00Z', status: 'COMPLETED' as const, reward: 50 },
  { id: 'r2', username: 'JaneDoe42', date: '2026-03-05T14:30:00Z', status: 'COMPLETED' as const, reward: 50 },
  { id: 'r3', username: 'MarketMaker99', date: '2026-03-01T09:00:00Z', status: 'PENDING' as const, reward: 0 },
  { id: 'r4', username: 'PredictionKing', date: '2026-02-25T16:45:00Z', status: 'COMPLETED' as const, reward: 50 },
  { id: 'r5', username: 'SwiftTrader', date: '2026-02-20T11:15:00Z', status: 'COMPLETED' as const, reward: 50 },
]

const HOW_IT_WORKS = [
  { step: 1, emoji: '🔗', title: 'Share your link', desc: 'Send your unique referral link to friends via social media, email, or direct message' },
  { step: 2, emoji: '👋', title: 'Friend signs up', desc: 'Your friend creates an account using your referral link or code' },
  { step: 3, emoji: '💰', title: 'Friend deposits', desc: 'When your friend makes their first Gold Coin purchase, the referral is activated' },
  { step: 4, emoji: '🎉', title: 'You both earn', desc: 'You receive 50 SC and your friend gets 25 SC as a welcome bonus' },
]

export default function ReferralsPage() {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(REFERRAL_CODE)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(REFERRAL_LINK)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const totalReferrals = MOCK_REFERRALS.length
  const completedReferrals = MOCK_REFERRALS.filter(r => r.status === 'COMPLETED')
  const rewardsEarned = completedReferrals.reduce((sum, r) => sum + r.reward, 0)
  const pendingRewards = MOCK_REFERRALS.filter(r => r.status === 'PENDING').length * 50

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referrals</h1>
        <p className="text-sm text-fg-muted mt-1">Earn Sweeps Coins by inviting friends to Predictly</p>
      </div>

      {/* Referral code + share link */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Referral code */}
        <div className="rounded-xl bg-bg-subtle border border-border p-5">
          <h2 className="text-sm font-semibold mb-3">Your Referral Code</h2>
          <div className="flex items-center gap-3">
            <code className="flex-1 px-4 py-3 rounded-lg bg-bg border border-border text-base font-mono text-brand tracking-wider">
              {REFERRAL_CODE}
            </code>
            <button
              onClick={copyCode}
              className="h-12 w-12 rounded-lg bg-bg border border-border hover:border-border-strong flex items-center justify-center transition-colors shrink-0"
            >
              {copiedCode ? <Check className="h-5 w-5 text-yes" /> : <Copy className="h-5 w-5 text-fg-muted" />}
            </button>
          </div>
        </div>

        {/* Share link with social buttons */}
        <div className="rounded-xl bg-bg-subtle border border-border p-5">
          <h2 className="text-sm font-semibold mb-3">Share Link</h2>
          <div className="flex items-center gap-3 mb-4">
            <code className="flex-1 px-4 py-3 rounded-lg bg-bg border border-border text-xs font-mono text-fg-muted truncate">
              {REFERRAL_LINK}
            </code>
            <button
              onClick={copyLink}
              className="h-12 w-12 rounded-lg bg-bg border border-border hover:border-border-strong flex items-center justify-center transition-colors shrink-0"
            >
              {copiedLink ? <Check className="h-5 w-5 text-yes" /> : <Copy className="h-5 w-5 text-fg-muted" />}
            </button>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 h-9 rounded-lg bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 text-[#1DA1F2] text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#1DA1F2]/20 transition-colors">
              <Twitter className="h-3.5 w-3.5" /> Twitter
            </button>
            <button className="flex-1 h-9 rounded-lg bg-[#4A154B]/10 border border-[#4A154B]/30 text-[#7289DA] text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#4A154B]/20 transition-colors">
              <MessageCircle className="h-3.5 w-3.5" /> Discord
            </button>
            <button className="flex-1 h-9 rounded-lg bg-bg border border-border text-fg-muted text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-bg-elevated transition-colors">
              <Mail className="h-3.5 w-3.5" /> Email
            </button>
          </div>
        </div>
      </div>

      {/* Referral stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-bg-subtle border border-border p-5 text-center">
          <div className="flex items-center justify-center gap-2 text-2xs text-fg-subtle uppercase tracking-wider mb-2">
            <Users className="h-4 w-4" /> Total Referrals
          </div>
          <div className="text-3xl font-bold tabular-nums">{totalReferrals}</div>
        </div>
        <div className="rounded-xl bg-yes-soft/20 border border-yes-border p-5 text-center">
          <div className="flex items-center justify-center gap-2 text-2xs text-yes uppercase tracking-wider mb-2">
            <Coins className="h-4 w-4" /> Rewards Earned
          </div>
          <div className="text-3xl font-bold tabular-nums text-yes">{rewardsEarned} SC</div>
        </div>
        <div className="rounded-xl bg-gold-soft/20 border border-gold-border p-5 text-center">
          <div className="flex items-center justify-center gap-2 text-2xs text-gold uppercase tracking-wider mb-2">
            <Clock className="h-4 w-4" /> Pending Rewards
          </div>
          <div className="text-3xl font-bold tabular-nums text-gold">{pendingRewards} SC</div>
        </div>
      </div>

      {/* How referrals work */}
      <div className="rounded-xl bg-bg-subtle border border-border p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Gift className="h-4 w-4 text-brand" /> How Referrals Work
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="relative">
              <div className="rounded-xl bg-bg border border-border p-4 h-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-7 w-7 rounded-full bg-brand-soft text-brand text-xs font-bold flex items-center justify-center shrink-0">
                    {item.step}
                  </span>
                  <span className="text-xl">{item.emoji}</span>
                </div>
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-2xs text-fg-muted leading-relaxed">{item.desc}</p>
              </div>
              {item.step < 4 && (
                <ChevronRight className="hidden lg:block absolute right-[-14px] top-1/2 -translate-y-1/2 h-5 w-5 text-fg-subtle z-10" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Referral history table */}
      <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Referral History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-2xs text-fg-subtle uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_REFERRALS.map((ref) => (
                <tr key={ref.id} className="hover:bg-bg-elevated transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand to-yes flex items-center justify-center text-xs font-bold text-white">
                        {ref.username[0]}
                      </div>
                      <span className="font-medium">{ref.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-fg-muted tabular-nums">{formatDate(ref.date)}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex px-2 h-5 rounded-full text-2xs font-medium',
                      ref.status === 'COMPLETED' ? 'bg-yes-soft text-yes' : 'bg-gold-soft text-gold'
                    )}>
                      {ref.status}
                    </span>
                  </td>
                  <td className={cn(
                    'px-4 py-3 text-right font-semibold tabular-nums',
                    ref.reward > 0 ? 'text-yes' : 'text-fg-subtle'
                  )}>
                    {ref.reward > 0 ? `+${ref.reward} SC` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {MOCK_REFERRALS.length === 0 && (
          <div className="py-12 text-center">
            <Gift className="mx-auto h-10 w-10 text-fg-subtle opacity-40 mb-3" />
            <p className="text-sm text-fg-muted">No referrals yet. Share your link to start earning!</p>
          </div>
        )}
      </div>
    </div>
  )
}
