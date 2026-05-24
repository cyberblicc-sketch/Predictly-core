'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Share2, Bookmark, Flag, Users, TrendingUp,
  Clock, ExternalLink, ChevronRight, MessageCircle, Activity,
  BarChart3,
} from 'lucide-react'
import { markets, histories } from '@/lib/mockData'
import { TradeForm } from '@/components/trade/TradeForm'
import { ProbabilityChart } from '@/components/market/ProbabilityChart'
import { OrderBook } from '@/components/market/OrderBook'
import { ActivityFeed } from '@/components/market/ActivityFeed'
import { cn, formatUSD, formatCompact, formatDate, timeUntil } from '@/lib/utils'

const TABS = ['Overview', 'Orderbook', 'Activity', 'Comments', 'Resolution'] as const

export default function MarketDetailPage() {
  const params = useParams<{ id: string }>()
  const market = markets.find((m) => m.id === params.id) ?? null
  const [tab, setTab] = useState<typeof TABS[number]>('Overview')
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | undefined>()

  if (!market) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-semibold mb-2">Market not found</h1>
        <p className="text-fg-muted">It might have been resolved or removed.</p>
        <Link href="/markets" className="mt-4 inline-block text-brand hover:underline">
          ← Back to markets
        </Link>
      </div>
    )
  }

  const history = histories[market.id] || []
  const isBinary = market.outcomes.length === 2 &&
    market.outcomes[0].label.toLowerCase() === 'yes' &&
    market.outcomes[1].label.toLowerCase() === 'no'

  const yesOutcome = market.outcomes.find((o) => o.label.toLowerCase() === 'yes')
  const yesPrice = yesOutcome?.price ?? market.outcomes[0].price
  const featuredLabel = isBinary ? 'Yes' : market.outcomes[0].label

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-fg-muted">
        <Link href="/markets" className="inline-flex items-center gap-1.5 hover:text-fg transition-colors">
          <ArrowLeft className="h-4 w-4" /> Markets
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-fg-subtle" />
        <span className="text-fg truncate max-w-xs">{market.shortTitle}</span>
      </nav>

      {/* Market header */}
      <div className="flex flex-col lg:flex-row gap-5 lg:items-start lg:justify-between">
        <div className="flex gap-4 items-start flex-1 min-w-0">
          <div className={cn(
            'h-14 w-14 lg:h-16 lg:w-16 rounded-xl bg-gradient-to-br flex items-center justify-center text-3xl lg:text-4xl border border-border shrink-0',
            market.imageColor
          )}>
            {market.imageEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 h-6 rounded-md bg-bg-subtle border border-border text-2xs font-medium text-fg-muted inline-flex items-center">
                {market.category}
              </span>
              {market.tags.map((t) => (
                <span key={t} className="text-2xs text-fg-subtle">#{t}</span>
              ))}
              {market.trending && (
                <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-no-soft border border-no-border text-no text-2xs font-medium">
                  🔥 Trending
                </span>
              )}
              {market.isNew && (
                <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-brand-soft border border-brand/30 text-brand-hover text-2xs font-medium">
                  ✨ New
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
              {market.question}
            </h1>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-fg-muted">
              <Meta icon={<TrendingUp className="h-3.5 w-3.5" />}>
                {formatUSD(market.volume)} volume
              </Meta>
              <Meta icon={<Users className="h-3.5 w-3.5" />}>
                {formatCompact(market.traders)} traders
              </Meta>
              <Meta icon={<Clock className="h-3.5 w-3.5" />}>
                Closes in {timeUntil(market.closeAt)} · {formatDate(market.closeAt)}
              </Meta>
              <Meta icon={<Activity className="h-3.5 w-3.5" />}>
                {formatUSD(market.liquidity)} liquidity
              </Meta>
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <IconBtn><Bookmark className="h-4 w-4" /></IconBtn>
          <IconBtn><Share2 className="h-4 w-4" /></IconBtn>
          <IconBtn><Flag className="h-4 w-4" /></IconBtn>
        </div>
      </div>

      {/* Two-column layout: main content + trade panel */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-5 min-w-0">
          {/* Outcomes summary for multi-outcome markets */}
          {!isBinary && (
            <div className="rounded-xl bg-bg-subtle border border-border p-4">
              <h2 className="text-sm font-semibold mb-3">Outcomes</h2>
              <div className="space-y-2.5">
                {market.outcomes.map((o) => {
                  const isSelected = selectedOutcomeId === o.id
                  const pos = o.delta7d >= 0
                  return (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOutcomeId(isSelected ? undefined : o.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2.5 rounded-lg border transition-colors text-left',
                        isSelected
                          ? 'border-brand bg-brand-soft'
                          : 'border-border bg-bg hover:bg-bg-elevated'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          {o.label}
                          <span className={cn('text-2xs tabular-nums', pos ? 'text-yes' : 'text-no')}>
                            {pos ? '▲' : '▼'} {Math.abs(o.delta7d * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-brand to-yes" style={{ width: `${o.price * 100}%` }} />
                        </div>
                      </div>
                      <div className="w-16 text-right">
                        <div className="text-base font-bold tabular-nums">{Math.round(o.price * 100)}%</div>
                        <div className="text-2xs text-fg-subtle">{formatUSD(o.volume)} vol</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

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

          {/* Tab: Overview */}
          {tab === 'Overview' && (
            <>
              <ProbabilityChart data={history} outcomeLabel={featuredLabel} />
              <section className="rounded-xl bg-bg-subtle border border-border p-5">
                <h2 className="text-sm font-semibold mb-3">About this market</h2>
                <p className="text-sm text-fg-muted leading-relaxed">{market.description}</p>
                <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Resolver" value={market.resolver} />
                  <InfoRow label="Category" value={market.category} />
                  <InfoRow label="Created" value={formatDate(market.createdAt)} />
                  <InfoRow label="Closes" value={formatDate(market.closeAt)} />
                </div>
                <a href="#" className="mt-4 inline-flex items-center gap-1 text-xs text-brand-hover hover:underline">
                  Read full resolution rules <ExternalLink className="h-3 w-3" />
                </a>
              </section>
              {/* Related markets */}
              <section>
                <h2 className="text-sm font-semibold mb-3">Related markets</h2>
                <div className="rounded-xl bg-bg-subtle border border-border divide-y divide-border">
                  {markets
                    .filter((m) => m.id !== market.id && m.category === market.category)
                    .slice(0, 4)
                    .map((m) => (
                      <Link key={m.id} href={`/markets/${m.id}`} className="flex items-center gap-3 p-3 hover:bg-bg-elevated transition-colors">
                        <div className={cn('h-10 w-10 rounded-md bg-gradient-to-br flex items-center justify-center text-lg border border-border shrink-0', m.imageColor)}>
                          {m.imageEmoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{m.question}</div>
                          <div className="text-2xs text-fg-subtle">{formatUSD(m.volume)} vol · {Math.round(m.outcomes[0].price * 100)}% {m.outcomes[0].label}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-fg-subtle" />
                      </Link>
                    ))}
                </div>
              </section>
            </>
          )}

          {/* Tab: Orderbook */}
          {tab === 'Orderbook' && (
            <div className="space-y-5">
              <OrderBook yesPrice={yesPrice} />
              {/* Depth chart placeholder */}
              <div className="rounded-xl bg-bg-subtle border border-border p-8 text-center">
                <BarChart3 className="mx-auto h-10 w-10 text-fg-subtle opacity-40 mb-3" />
                <p className="text-sm text-fg-muted">Depth chart visualization coming soon</p>
                <p className="text-2xs text-fg-subtle mt-1">Real-time bid/ask depth visualization</p>
              </div>
            </div>
          )}

          {/* Tab: Activity */}
          {tab === 'Activity' && <ActivityFeed marketId={market.id} limit={20} />}

          {/* Tab: Comments */}
          {tab === 'Comments' && (
            <div className="rounded-xl bg-bg-subtle border border-border p-8 text-center">
              <MessageCircle className="mx-auto h-10 w-10 text-fg-subtle opacity-60 mb-3" />
              <p className="text-sm font-medium text-fg-muted mb-1">Join the conversation</p>
              <p className="text-2xs text-fg-subtle mb-4">Be the first to share your prediction and analysis</p>
              <button className="h-10 px-6 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-semibold transition-colors">
                Sign in to comment
              </button>
            </div>
          )}

          {/* Tab: Resolution */}
          {tab === 'Resolution' && (
            <div className="rounded-xl bg-bg-subtle border border-border p-5">
              <h3 className="text-sm font-semibold mb-3">Resolution criteria</h3>
              <p className="text-sm text-fg-muted leading-relaxed">{market.description}</p>
              <div className="mt-4 rounded-lg bg-bg p-4 text-sm border border-border">
                <strong className="text-fg">Primary source:</strong> <span className="text-fg-muted">{market.resolver}</span>
              </div>
              <div className="mt-3 rounded-lg bg-bg p-4 text-sm border border-border">
                <strong className="text-fg">Resolution type:</strong> <span className="text-fg-muted">Automated via verified source</span>
              </div>
              <div className="mt-3 rounded-lg bg-warn/10 border border-warn/20 p-4 text-sm">
                <strong className="text-warn">Dispute window:</strong> <span className="text-fg-muted">48 hours after proposed resolution</span>
              </div>
            </div>
          )}
        </div>

        {/* Trade panel — sticky sidebar */}
        <aside className="lg:sticky lg:top-20 self-start">
          <TradeForm
            market={market}
            defaultOutcomeId={selectedOutcomeId}
          />
        </aside>
      </div>
    </div>
  )
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon} {children}
    </span>
  )
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="h-10 w-10 rounded-lg bg-bg-subtle border border-border hover:border-border-strong text-fg-muted hover:text-fg flex items-center justify-center transition-colors">
      {children}
    </button>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xs text-fg-subtle uppercase tracking-wider">{label}</div>
      <div className="text-sm font-medium text-fg mt-0.5">{value}</div>
    </div>
  )
}
