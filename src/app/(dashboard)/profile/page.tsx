'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User, Shield, Mail, Calendar, Copy, Check, ExternalLink,
  Twitter, Globe, Wallet, Crown, Award, Star, Zap,
  TrendingUp, BarChart3, Target, Briefcase, Edit3,
  Gift, Bell, Lock, Settings,
} from 'lucide-react'
import { cn, formatUSD, formatDate, formatPct } from '@/lib/utils'
import { mockUser, portfolio, transactions } from '@/lib/mockData'

const TABS = ['Overview', 'Settings', 'Notifications', 'Security'] as const

const ACHIEVEMENTS = [
  { emoji: '🎯', title: 'First Trade', desc: 'Made your first prediction', unlocked: true },
  { emoji: '🔥', title: 'Hot Streak', desc: '5 wins in a row', unlocked: true },
  { emoji: '🐋', title: 'Whale', desc: 'Traded over $10K volume', unlocked: true },
  { emoji: '🏆', title: 'Champion', desc: 'Won a resolved market', unlocked: true },
  { emoji: '💎', title: 'Diamond Hands', desc: 'Held a position for 30+ days', unlocked: false },
  { emoji: '🧠', title: 'Sharp', desc: 'Win rate above 70%', unlocked: false },
]

const QUICK_ACTIONS = [
  { href: '/portfolio', icon: Briefcase, label: 'View Portfolio' },
  { href: '/history', icon: BarChart3, label: 'Transaction History' },
  { href: '/referrals', icon: Gift, label: 'Refer a Friend' },
  { href: '/kyc', icon: Shield, label: 'KYC Verification' },
]

export default function ProfilePage() {
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<typeof TABS[number]>('Overview')
  const user = mockUser

  const copyReferral = () => {
    navigator.clipboard.writeText('https://predictly.io/r/TRADERPRO')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalPnl = portfolio.positions.reduce((sum, p) => sum + (p.pnl || 0), 0)
  const winningPositions = portfolio.positions.filter(p => (p.pnl ?? 0) > 0).length
  const winRate = portfolio.positions.length > 0 ? winningPositions / portfolio.positions.length : 0

  return (
    <div className="space-y-6">
      {/* Profile header card */}
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Gradient banner */}
        <div className="h-32 bg-gradient-to-r from-brand/40 via-brand/20 to-yes/30 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(99,102,241,0.15),transparent_70%)]" />
        </div>

        {/* Profile info */}
        <div className="bg-bg-subtle px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand to-yes flex items-center justify-center text-3xl font-bold text-white border-4 border-bg-subtle shrink-0 shadow-lg">
              {user.username[0]}
            </div>

            <div className="flex-1 min-w-0 pt-2 sm:pt-0 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold">{user.username}</h1>
                {/* Badges */}
                <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-brand-soft text-brand-hover text-2xs font-semibold border border-brand/30">
                  <Star className="h-3 w-3" /> Pro
                </span>
                <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-yes-soft text-yes text-2xs font-semibold border border-yes-border">
                  <Shield className="h-3 w-3" /> Verified
                </span>
                <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-gold-soft text-gold text-2xs font-semibold border border-gold-border">
                  <Crown className="h-3 w-3" /> Gold Tier
                </span>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-3 mt-2 text-xs text-fg-muted">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Joined {formatDate(user.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1.5 text-xs text-fg-subtle">
                <span className="flex items-center gap-1 hover:text-fg cursor-pointer transition-colors">
                  <Twitter className="h-3.5 w-3.5" /> @traderpro
                </span>
                <span className="flex items-center gap-1 hover:text-fg cursor-pointer transition-colors">
                  <Globe className="h-3.5 w-3.5" /> predictly.io
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Wallet className="h-3.5 w-3.5" /> 0x7f3...a92d
                </span>
              </div>
            </div>

            {/* Edit profile button */}
            <button className="h-10 px-4 rounded-lg bg-bg border border-border hover:border-border-strong text-sm font-medium flex items-center gap-2 transition-colors shrink-0">
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-bg-subtle border border-border p-4">
          <div className="flex items-center gap-2 text-2xs text-fg-subtle uppercase tracking-wider mb-2">
            <TrendingUp className="h-3.5 w-3.5" /> Net P&L
          </div>
          <div className={cn('text-xl font-bold tabular-nums', totalPnl >= 0 ? 'text-profit' : 'text-loss')}>
            {totalPnl >= 0 ? '+' : ''}{formatUSD(Math.abs(totalPnl), { compact: false })}
          </div>
        </div>
        <div className="rounded-xl bg-bg-subtle border border-border p-4">
          <div className="flex items-center gap-2 text-2xs text-fg-subtle uppercase tracking-wider mb-2">
            <BarChart3 className="h-3.5 w-3.5" /> Volume Traded
          </div>
          <div className="text-xl font-bold tabular-nums">{formatUSD(124000)}</div>
        </div>
        <div className="rounded-xl bg-bg-subtle border border-border p-4">
          <div className="flex items-center gap-2 text-2xs text-fg-subtle uppercase tracking-wider mb-2">
            <Target className="h-3.5 w-3.5" /> Win Rate
          </div>
          <div className="text-xl font-bold tabular-nums">{formatPct(winRate)}</div>
        </div>
        <div className="rounded-xl bg-bg-subtle border border-border p-4">
          <div className="flex items-center gap-2 text-2xs text-fg-subtle uppercase tracking-wider mb-2">
            <Briefcase className="h-3.5 w-3.5" /> Active Positions
          </div>
          <div className="text-xl font-bold tabular-nums">{portfolio.positions.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'shrink-0 h-10 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
                tab === t ? 'border-brand text-fg' : 'border-transparent text-fg-muted hover:text-fg'
              )}
            >
              {t === 'Settings' && <Settings className="h-4 w-4" />}
              {t === 'Notifications' && <Bell className="h-4 w-4" />}
              {t === 'Security' && <Lock className="h-4 w-4" />}
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview */}
      {tab === 'Overview' && (
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-5">
            {/* Recent trades */}
            <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">Recent Trades</h3>
              </div>
              <ul className="divide-y divide-border">
                {transactions.slice(0, 6).map((tx) => (
                  <li key={tx.id} className="px-4 py-3 flex items-center gap-3 hover:bg-bg-elevated transition-colors">
                    <div className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center text-base shrink-0',
                      tx.type === 'TRADE' ? 'bg-brand-soft' :
                      tx.type === 'DEPOSIT' || tx.type === 'GC_PURCHASE' ? 'bg-yes-soft' :
                      'bg-gold-soft'
                    )}>
                      {tx.type === 'TRADE' ? '🔄' : tx.type === 'DEPOSIT' ? '💰' : '🎁'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{tx.description}</div>
                      <div className="text-2xs text-fg-subtle">{formatDate(tx.createdAt)}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={cn(
                        'text-sm font-semibold tabular-nums',
                        tx.type === 'WITHDRAWAL' ? 'text-loss' : 'text-profit'
                      )}>
                        {tx.type === 'WITHDRAWAL' ? '-' : '+'}{tx.amount.toLocaleString()} {tx.currency}
                      </div>
                      <span className={cn(
                        'text-2xs font-medium',
                        tx.status === 'COMPLETED' ? 'text-yes' :
                        tx.status === 'PENDING' ? 'text-gold' : 'text-no'
                      )}>
                        {tx.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Achievements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ACHIEVEMENTS.map((ach) => (
                  <div
                    key={ach.title}
                    className={cn(
                      'rounded-xl border p-4 text-center transition-colors',
                      ach.unlocked
                        ? 'bg-bg-subtle border-border hover:border-border-strong'
                        : 'bg-bg-subtle/50 border-border/50 opacity-50'
                    )}
                  >
                    <div className="text-2xl mb-2">{ach.emoji}</div>
                    <div className="text-xs font-semibold">{ach.title}</div>
                    <div className="text-2xs text-fg-subtle mt-0.5">{ach.desc}</div>
                    {ach.unlocked && (
                      <span className="inline-flex items-center gap-0.5 mt-2 text-2xs text-yes font-medium">
                        <Award className="h-3 w-3" /> Unlocked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick actions sidebar */}
          <aside className="space-y-4">
            <div className="rounded-xl bg-bg-subtle border border-border p-4">
              <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-fg-muted hover:text-fg hover:bg-bg-elevated transition-colors"
                  >
                    <action.icon className="h-4 w-4 shrink-0" />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Referral card */}
            <div className="rounded-xl bg-gradient-to-br from-brand/10 to-yes/10 border border-brand/20 p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Gift className="h-4 w-4 text-brand" /> Refer & Earn
              </h3>
              <p className="text-2xs text-fg-muted mb-3">Share your link and earn 50 SC for each friend who joins</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-bg border border-border text-2xs font-mono text-brand truncate">
                  predictly.io/r/TRADERPRO
                </code>
                <button
                  onClick={copyReferral}
                  className="h-9 w-9 rounded-lg bg-bg border border-border hover:border-border-strong flex items-center justify-center transition-colors shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-yes" /> : <Copy className="h-4 w-4 text-fg-muted" />}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Tab: Settings */}
      {tab === 'Settings' && (
        <div className="rounded-xl bg-bg-subtle border border-border p-6 space-y-5">
          <h3 className="text-sm font-semibold">Account Settings</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-fg-muted mb-1.5 block">Display Name</label>
              <input
                type="text"
                defaultValue={user.username}
                className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-fg-muted mb-1.5 block">Email</label>
              <input
                type="email"
                defaultValue={user.email}
                className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-brand"
              />
            </div>
          </div>
          <button className="h-10 px-6 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-semibold transition-colors">
            Save Changes
          </button>
        </div>
      )}

      {/* Tab: Notifications */}
      {tab === 'Notifications' && (
        <div className="rounded-xl bg-bg-subtle border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold">Notification Preferences</h3>
          {[
            { label: 'Trade confirmations', desc: 'Get notified when your trades execute', enabled: true },
            { label: 'Market resolutions', desc: 'Alerts when markets you traded on resolve', enabled: true },
            { label: 'Price alerts', desc: 'Notify when a market hits your target price', enabled: false },
            { label: 'Promotional emails', desc: 'Special offers and platform updates', enabled: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-2xs text-fg-muted">{item.desc}</div>
              </div>
              <button className={cn(
                'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors',
                item.enabled ? 'bg-brand' : 'bg-bg-elevated border border-border'
              )}>
                <span className={cn(
                  'inline-block h-5 w-5 rounded-full bg-white transition-transform shadow-sm',
                  item.enabled ? 'translate-x-5.5 mt-0.5' : 'translate-x-0.5 mt-0.5'
                )} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Security */}
      {tab === 'Security' && (
        <div className="rounded-xl bg-bg-subtle border border-border p-6 space-y-5">
          <h3 className="text-sm font-semibold">Security Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-sm font-medium">Two-Factor Authentication</div>
                <div className="text-2xs text-fg-muted">Add an extra layer of security to your account</div>
              </div>
              <button className="h-9 px-4 rounded-lg bg-bg border border-border text-sm font-medium hover:border-border-strong transition-colors">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-sm font-medium">Change Password</div>
                <div className="text-2xs text-fg-muted">Update your account password</div>
              </div>
              <button className="h-9 px-4 rounded-lg bg-bg border border-border text-sm font-medium hover:border-border-strong transition-colors">
                Update
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium">Active Sessions</div>
                <div className="text-2xs text-fg-muted">Manage your active login sessions</div>
              </div>
              <span className="text-sm text-fg-muted">1 active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
