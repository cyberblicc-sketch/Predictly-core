'use client'

import { useState, useMemo } from 'react'
import { Info, ChevronDown } from 'lucide-react'
import type { Market } from '@/lib/mockData'
import { cn, formatUSD } from '@/lib/utils'

interface TradePanelProps {
  market: Market
  defaultOutcomeId?: string
}

const QUICK_AMOUNTS = [10, 50, 100, 500]

export function TradePanel({ market, defaultOutcomeId }: TradePanelProps) {
  const isBinary = market.outcomes.length === 2 &&
    market.outcomes[0].label.toLowerCase() === 'yes' &&
    market.outcomes[1].label.toLowerCase() === 'no'

  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [outcomeId, setOutcomeId] = useState(
    defaultOutcomeId ??
    (isBinary ? 'yes' : market.outcomes[0].id)
  )
  const [amount, setAmount] = useState<string>('')
  const [type, setType] = useState<'market' | 'limit'>('market')
  const [limitPrice, setLimitPrice] = useState('')

  const outcome = market.outcomes.find((o) => o.id === outcomeId) ?? market.outcomes[0]
  const price = type === 'limit' && limitPrice ? +limitPrice / 100 : outcome.price
  const amt = +amount || 0

  const shares = amt > 0 && price > 0 ? amt / price : 0
  const potentialPayout = shares * 1 // $1 per winning share
  const potentialProfit = potentialPayout - amt

  const isBuy = side === 'buy'

  return (
    <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
      {/* Buy / Sell tabs */}
      <div className="grid grid-cols-2 border-b border-border">
        {(['buy', 'sell'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={cn(
              'h-11 text-sm font-semibold capitalize transition-colors relative',
              side === s
                ? 'text-fg bg-bg-elevated'
                : 'text-fg-muted hover:text-fg'
            )}
          >
            {s}
            {side === s && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand" />
            )}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* Outcome picker */}
        <div>
          <label className="text-2xs uppercase tracking-wider text-fg-subtle font-medium">
            Outcome
          </label>
          {isBinary ? (
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setOutcomeId('yes')}
                className={cn(
                  'h-12 rounded-lg border text-sm font-semibold flex items-center justify-center gap-1.5 transition-all',
                  outcomeId === 'yes'
                    ? 'bg-yes text-bg border-yes'
                    : 'bg-yes-soft text-yes border-yes-border hover:bg-yes/20'
                )}
              >
                <span>Yes</span>
                <span className="text-xs opacity-90">
                  {Math.round((market.outcomes.find((o) => o.id === 'yes')?.price ?? 0) * 100)}¢
                </span>
              </button>
              <button
                onClick={() => setOutcomeId('no')}
                className={cn(
                  'h-12 rounded-lg border text-sm font-semibold flex items-center justify-center gap-1.5 transition-all',
                  outcomeId === 'no'
                    ? 'bg-no text-bg border-no'
                    : 'bg-no-soft text-no border-no-border hover:bg-no/20'
                )}
              >
                <span>No</span>
                <span className="text-xs opacity-90">
                  {Math.round((market.outcomes.find((o) => o.id === 'no')?.price ?? 0) * 100)}¢
                </span>
              </button>
            </div>
          ) : (
            <div className="mt-1.5 relative">
              <select
                value={outcomeId}
                onChange={(e) => setOutcomeId(e.target.value)}
                className="w-full h-11 px-3 pr-9 rounded-lg bg-bg border border-border text-sm font-medium appearance-none focus:outline-none focus:border-brand"
              >
                {market.outcomes.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label} — {Math.round(o.price * 100)}¢
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle pointer-events-none" />
            </div>
          )}
        </div>

        {/* Order type */}
        <div>
          <label className="text-2xs uppercase tracking-wider text-fg-subtle font-medium">
            Order type
          </label>
          <div className="mt-1.5 grid grid-cols-2 gap-1 p-1 bg-bg rounded-lg border border-border">
            {(['market', 'limit'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'h-8 rounded-md text-xs font-semibold capitalize transition-colors',
                  type === t ? 'bg-bg-elevated text-fg' : 'text-fg-muted'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Limit price (only shown for limit orders) */}
        {type === 'limit' && (
          <div>
            <label className="text-2xs uppercase tracking-wider text-fg-subtle font-medium">
              Limit price (¢)
            </label>
            <input
              type="number"
              min={1}
              max={99}
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={`${Math.round(outcome.price * 100)}`}
              className="mt-1.5 w-full h-11 px-3 rounded-lg bg-bg border border-border text-sm tabular-nums focus:outline-none focus:border-brand"
            />
          </div>
        )}

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-2xs uppercase tracking-wider text-fg-subtle font-medium">
              Amount (USD)
            </label>
            <button className="text-2xs text-fg-muted hover:text-fg">Balance $12,482.55</button>
          </div>
          <div className="mt-1.5 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted">$</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-12 pl-7 pr-3 rounded-lg bg-bg border border-border text-lg font-semibold tabular-nums focus:outline-none focus:border-brand"
            />
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className="h-8 rounded-md text-xs font-medium bg-bg border border-border text-fg-muted hover:text-fg hover:border-border-strong tabular-nums"
              >
                ${q}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-bg p-3 space-y-2 text-xs">
          <Row label="Avg price">
            <span className="tabular-nums">{Math.round(price * 100)}¢</span>
          </Row>
          <Row label="Shares">
            <span className="tabular-nums">{shares.toFixed(2)}</span>
          </Row>
          <Row label="Potential payout" tooltip="If your outcome resolves yes, each share pays $1.">
            <span className="tabular-nums text-fg">
              {formatUSD(potentialPayout, { compact: false })}
            </span>
          </Row>
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-fg-muted">Potential profit</span>
            <span className={cn(
              'font-semibold tabular-nums',
              potentialProfit > 0 ? 'text-yes' : 'text-fg-muted'
            )}>
              {potentialProfit > 0 ? '+' : ''}
              {formatUSD(potentialProfit, { compact: false })}
              {amt > 0 && (
                <span className="ml-1 text-fg-subtle">
                  ({((potentialProfit / amt) * 100).toFixed(0)}%)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          className={cn(
            'w-full h-12 rounded-lg text-sm font-semibold transition-colors',
            outcomeId === 'no'
              ? 'bg-no hover:bg-no/90 text-bg'
              : 'bg-yes hover:bg-yes/90 text-bg',
            !amt && 'opacity-50 cursor-not-allowed'
          )}
          disabled={!amt}
        >
          {isBuy ? 'Buy' : 'Sell'} {outcome.label} at {Math.round(price * 100)}¢
        </button>

        <p className="text-2xs text-fg-subtle text-center leading-relaxed">
          By trading you agree to the <span className="text-fg-muted underline cursor-pointer">Terms</span>.
          Markets resolve based on official sources.
        </p>
      </div>
    </div>
  )
}

function Row({
  label, children, tooltip,
}: {
  label: string; children: React.ReactNode; tooltip?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-muted flex items-center gap-1">
        {label}
        {tooltip && (
          <span title={tooltip}>
            <Info className="h-3 w-3 text-fg-subtle" />
          </span>
        )}
      </span>
      {children}
    </div>
  )
}
