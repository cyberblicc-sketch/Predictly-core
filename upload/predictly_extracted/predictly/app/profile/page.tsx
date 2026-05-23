'use client'

import { useState } from 'react'
import { Settings, Copy, Shield, Bell, Key, LogOut, Check, Edit3, Twitter, Globe, Crown } from 'lucide-react'
import { formatUSD, cn } from '@/lib/utils'
import { portfolio } from '@/lib/mockData'

const TABS = ['Overview', 'Settings', 'Notifications', 'Security'] as const

export default function ProfilePage() {
  const [tab, setTab] = useState<typeof TABS[number]>('Overview')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText('0x742d...3F1a')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6">
      {/* Profile header */}
      <div className="rounded-2xl bg-bg-subtle border border-border overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-br from-brand/30 via-yes/20 to-no/20" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-brand to-yes border-4 border-bg-subtle flex items-center justify-center text-4xl font-bold text-white">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">alex.predict</h1>
                <span className="px-2 h-6 rounded-md bg-warn/15 border border-warn/30 text-warn text-2xs font-semibold inline-flex items-center gap-1">
                  <Crown className="h-3 w-3" /> Pro
                </span>
                <span className="px-2 h-6 rounded-md bg-yes-soft border border-yes-border text-yes text-2xs font-semibold inline-flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Verified
                </span>
              </div>
              <p className="text-sm text-fg-muted mt-1">
                Macro trader, prediction market enthusiast · Joined Mar 2025
              </p>
              <div className="mt-2 flex items-center gap-3 text-2xs text-fg-subtle">
                <button onClick={handleCopy} className="inline-flex items-center gap-1.5 hover:text-fg">
                  {copied ? <Check className="h-3 w-3 text-yes" /> : <Copy className="h-3 w-3" />}
                  0x742d...3F1a
                </button>
                <a href="#" className="inline-flex items-center gap-1 hover:text-fg">
                  <Twitter className="h-3 w-3" /> @alexpredict
                </a>
                <a href="#" className="inline-flex items-center gap-1 hover:text-fg">
                  <Globe className="h-3 w-3" /> alex.xyz
                </a>
              </div>
            </div>
            <button className="h-10 px-4 rounded-lg bg-bg border border-border hover:border-border-strong text-sm font-medium inline-flex items-center gap-1.5">
              <Edit3 className="h-3.5 w-3.5" /> Edit profile
            </button>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Net P&L" value={<span className="text-yes">+{formatUSD(42_180)}</span>} />
            <Stat label="Volume traded" value={formatUSD(412_300)} />
            <Stat label="Win rate" value="68%" />
            <Stat label="Active positions" value={String(portfolio.positions.length)} />
          </div>
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
                'shrink-0 h-10 px-4 text-sm font-medium border-b-2 transition-colors',
                tab === t ? 'border-brand text-fg' : 'border-transparent text-fg-muted hover:text-fg'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'Overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Recent trades">
              <ul className="divide-y divide-border -mx-5">
                {[
                  { side: 'YES', mkt: 'BTC to $200k by 2026', amt: 1_200, price: 0.62, ago: '2h' },
                  { side: 'JD Vance', mkt: '2028 US President', amt: 800, price: 0.34, ago: '5h' },
                  { side: 'NO', mkt: 'US recession 2026', amt: 540, price: 0.68, ago: '1d' },
                  { side: 'YES', mkt: 'GPT-5 before July 2026', amt: 220, price: 0.71, ago: '2d' },
                ].map((t, i) => (
                  <li key={i} className="px-5 py-3 flex items-center gap-3 text-sm">
                    <span className={cn(
                      'px-2 h-6 rounded text-2xs font-semibold inline-flex items-center',
                      t.side === 'NO'
                        ? 'bg-no-soft text-no'
                        : t.side === 'YES'
                          ? 'bg-yes-soft text-yes'
                          : 'bg-brand-soft text-brand-hover'
                    )}>
                      {t.side}
                    </span>
                    <span className="flex-1 truncate text-fg-muted">{t.mkt}</span>
                    <span className="text-fg tabular-nums font-medium">{formatUSD(t.amt)}</span>
                    <span className="text-2xs text-fg-subtle">{t.ago}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Achievements">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { emoji: '🎯', name: 'Sharp shooter', desc: '10 wins in a row' },
                  { emoji: '🐋', name: 'Whale watch', desc: '$1M+ volume' },
                  { emoji: '🔮', name: 'Oracle', desc: '75% win rate' },
                  { emoji: '🚀', name: 'Early bird', desc: 'Joined 2025' },
                ].map((b) => (
                  <div key={b.name} className="rounded-lg border border-border bg-bg p-3 text-center">
                    <div className="text-2xl">{b.emoji}</div>
                    <div className="text-xs font-semibold mt-1">{b.name}</div>
                    <div className="text-2xs text-fg-subtle">{b.desc}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Quick actions">
              <div className="space-y-2">
                <QuickAction icon={<Settings className="h-4 w-4" />} label="Account settings" />
                <QuickAction icon={<Bell className="h-4 w-4" />} label="Notification preferences" />
                <QuickAction icon={<Key className="h-4 w-4" />} label="API keys" />
                <QuickAction icon={<Shield className="h-4 w-4" />} label="Security" />
                <QuickAction icon={<LogOut className="h-4 w-4 text-no" />} label="Sign out" danger />
              </div>
            </Card>

            <Card title="Referral">
              <p className="text-xs text-fg-muted leading-relaxed">
                Share your link and earn 10% of trading fees from referred users.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 px-3 h-9 rounded-lg bg-bg border border-border text-xs flex items-center font-mono text-fg-muted truncate">
                  predictly.app/r/alex
                </code>
                <button onClick={handleCopy} className="h-9 px-3 rounded-lg bg-brand text-white text-xs font-semibold">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="mt-3 text-2xs text-fg-subtle">
                <span className="text-yes font-semibold">+{formatUSD(1_240)}</span> earned · 28 referrals
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab !== 'Overview' && (
        <Card title={tab}>
          <p className="text-sm text-fg-muted">
            {tab} settings will appear here. This is a demo placeholder.
          </p>
        </Card>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-2xs text-fg-subtle uppercase tracking-wider">{label}</div>
      <div className="text-lg font-bold tabular-nums mt-0.5">{value}</div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-bg-subtle border border-border p-5">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  )
}

function QuickAction({
  icon, label, danger,
}: {
  icon: React.ReactNode; label: string; danger?: boolean
}) {
  return (
    <button className={cn(
      'w-full flex items-center gap-3 px-3 h-10 rounded-lg bg-bg border border-border hover:border-border-strong transition-colors text-sm',
      danger ? 'text-no' : 'text-fg'
    )}>
      {icon}
      <span>{label}</span>
    </button>
  )
}
