'use client'

import * as React from 'react'
import { cn, formatCurrency, formatCents } from '@/lib/utils'
import type { Market, FeeBreakdown, Currency, MarketOutcome } from '@/types'
import { Loader2, Info, ArrowUpDown } from 'lucide-react'

interface TradeFormProps {
  market: Market
  defaultOutcomeId?: string
  onTrade?: (
    side: 'YES' | 'NO',
    outcomeId: string,
    amount: number,
    currency: Currency
  ) => Promise<void>
  disabled?: boolean
  gcBalance?: number
  scBalance?: number
}

export function TradeForm({
  market,
  defaultOutcomeId,
  onTrade,
  disabled,
  gcBalance,
  scBalance,
}: TradeFormProps) {
  // Binary market detection
  const isBinary =
    market.outcomes.length === 2 &&
    market.outcomes[0].label.toLowerCase() === 'yes' &&
    market.outcomes[1].label.toLowerCase() === 'no'

  // Resolve the selected outcome
  const [selectedOutcomeId, setSelectedOutcomeId] = React.useState<string>(
    defaultOutcomeId ?? market.outcomes[0].id
  )
  const selectedOutcome = market.outcomes.find(
    (o) => o.id === selectedOutcomeId
  ) ?? market.outcomes[0]

  // Trade direction
  const [direction, setDirection] = React.useState<'buy' | 'sell'>('buy')

  // For binary markets: YES/NO toggle
  const [binarySide, setBinarySide] = React.useState<'YES' | 'NO'>('YES')

  // Currency
  const [currency, setCurrency] = React.useState<Currency>('GC')

  // Order type
  const [orderType, setOrderType] = React.useState<'market' | 'limit'>(
    'market'
  )

  // Amount
  const [stake, setStake] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const stakeAmount = parseFloat(stake) || 0
  const houseFeeRate = 0.02
  const platformFeeRate = 0.01

  // Effective price based on binary side or multi-outcome
  const effectivePrice = isBinary
    ? binarySide === 'YES'
      ? market.outcomes.find((o) => o.label.toLowerCase() === 'yes')?.price ??
        0.5
      : market.outcomes.find((o) => o.label.toLowerCase() === 'no')?.price ??
        0.5
    : selectedOutcome.price

  const feeBreakdown: FeeBreakdown = React.useMemo(() => {
    const houseFee = stakeAmount * houseFeeRate
    const platformFee = stakeAmount * platformFeeRate
    const poolShare = stakeAmount - houseFee - platformFee

    return {
      stake: stakeAmount,
      houseFee,
      platformFee,
      poolShare,
      entryPrice: effectivePrice,
    }
  }, [stakeAmount, effectivePrice])

  const potentialPayout = React.useMemo(() => {
    if (feeBreakdown.poolShare <= 0 || feeBreakdown.entryPrice <= 0) return 0
    return feeBreakdown.poolShare / feeBreakdown.entryPrice
  }, [feeBreakdown])

  const quickAmounts = [10, 50, 100, 500]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (stakeAmount <= 0) return

    setIsLoading(true)
    try {
      if (onTrade) {
        const side = isBinary ? binarySide : 'YES'
        await onTrade(side, selectedOutcomeId, stakeAmount, currency)
      }
      setStake('')
    } catch (error) {
      console.error('Trade failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
      {/* Header with Buy/Sell toggle */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex gap-4 relative">
          <button
            type="button"
            onClick={() => setDirection('buy')}
            className={cn(
              'text-sm font-semibold pb-1 transition-colors relative',
              direction === 'buy' ? 'text-fg' : 'text-fg-muted hover:text-fg'
            )}
          >
            Buy
            {direction === 'buy' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setDirection('sell')}
            className={cn(
              'text-sm font-semibold pb-1 transition-colors relative',
              direction === 'sell' ? 'text-fg' : 'text-fg-muted hover:text-fg'
            )}
          >
            Sell
            {direction === 'sell' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
            )}
          </button>
        </div>

        {/* Market / Limit toggle */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-bg border border-border">
          <button
            type="button"
            onClick={() => setOrderType('market')}
            className={cn(
              'px-2.5 h-6 rounded-md text-2xs font-medium transition-colors',
              orderType === 'market'
                ? 'bg-bg-elevated text-fg'
                : 'text-fg-muted hover:text-fg'
            )}
          >
            Market
          </button>
          <button
            type="button"
            onClick={() => setOrderType('limit')}
            className={cn(
              'px-2.5 h-6 rounded-md text-2xs font-medium transition-colors',
              orderType === 'limit'
                ? 'bg-bg-elevated text-fg'
                : 'text-fg-muted hover:text-fg'
            )}
          >
            Limit
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Outcome selector */}
        {isBinary ? (
          /* Binary: YES / NO big buttons */
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setBinarySide('YES')
                setSelectedOutcomeId(
                  market.outcomes.find(
                    (o) => o.label.toLowerCase() === 'yes'
                  )?.id ?? market.outcomes[0].id
                )
              }}
              disabled={disabled}
              className={cn(
                'flex-1 h-12 rounded-lg text-sm font-bold transition-all',
                binarySide === 'YES'
                  ? 'bg-yes text-bg shadow-[0_0_16px_rgba(0,210,132,0.3)]'
                  : 'bg-yes-soft border border-yes-border text-yes hover:bg-yes/20'
              )}
            >
              YES ·{' '}
              {formatCents(
                market.outcomes.find(
                  (o) => o.label.toLowerCase() === 'yes'
                )?.price ?? 0.5
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setBinarySide('NO')
                setSelectedOutcomeId(
                  market.outcomes.find(
                    (o) => o.label.toLowerCase() === 'no'
                  )?.id ?? market.outcomes[1].id
                )
              }}
              disabled={disabled}
              className={cn(
                'flex-1 h-12 rounded-lg text-sm font-bold transition-all',
                binarySide === 'NO'
                  ? 'bg-no text-bg shadow-[0_0_16px_rgba(255,77,109,0.3)]'
                  : 'bg-no-soft border border-no-border text-no hover:bg-no/20'
              )}
            >
              NO ·{' '}
              {formatCents(
                market.outcomes.find(
                  (o) => o.label.toLowerCase() === 'no'
                )?.price ?? 0.5
              )}
            </button>
          </div>
        ) : (
          /* Multi-outcome list */
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-fg-muted">
              Choose Outcome
            </label>
            <div className="grid gap-1.5 max-h-40 overflow-y-auto no-scrollbar">
              {market.outcomes.map((o) => (
                <OutcomeButton
                  key={o.id}
                  outcome={o}
                  selected={o.id === selectedOutcomeId}
                  onClick={() => {
                    setSelectedOutcomeId(o.id)
                  }}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        )}

        {/* Currency selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-fg-muted">Currency</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrency('GC')}
              className={cn(
                'flex-1 h-10 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2',
                currency === 'GC'
                  ? 'bg-gold-soft border border-gold-border text-gold'
                  : 'bg-bg border border-border text-fg-muted hover:text-fg'
              )}
            >
              <span className="text-base">🪙</span> Gold Coins
            </button>
            <button
              type="button"
              onClick={() => setCurrency('SC')}
              className={cn(
                'flex-1 h-10 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2',
                currency === 'SC'
                  ? 'bg-sweeps-soft border border-sweeps-border text-sweeps'
                  : 'bg-bg border border-border text-fg-muted hover:text-fg'
              )}
            >
              <span className="text-base">💎</span> Sweeps Coins
            </button>
          </div>
        </div>

        {/* Balance display */}
        <button type="button" className="w-full h-9 rounded-lg bg-bg border border-border text-xs text-fg-muted hover:text-fg transition-colors flex items-center justify-center gap-1.5 tabular-nums">
          Balance: {currency === 'GC' ? (gcBalance ?? 50000).toLocaleString() : (scBalance ?? 2500).toLocaleString()} {currency}
        </button>

        {/* Amount input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-fg-muted">
            {direction === 'buy' ? 'Buy' : 'Sell'} Amount
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="Enter amount"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              min="0"
              step="0.01"
              disabled={disabled}
              className="w-full h-11 px-4 rounded-lg bg-bg border border-border text-sm text-fg focus:outline-none focus:border-brand placeholder:text-fg-subtle tabular-nums"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-fg-subtle font-medium">
              {currency}
            </span>
          </div>
          <div className="flex gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setStake(String(amt))}
                className="flex-1 h-8 rounded-md bg-bg border border-border text-xs font-medium text-fg-muted hover:text-fg hover:border-border-strong transition-colors tabular-nums"
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        {/* Limit price input */}
        {orderType === 'limit' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-fg-muted">
              Limit Price
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="Price in cents"
                min="1"
                max="99"
                step="1"
                className="w-full h-11 px-4 rounded-lg bg-bg border border-border text-sm text-fg focus:outline-none focus:border-brand placeholder:text-fg-subtle tabular-nums"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-fg-subtle font-medium">
                ¢
              </span>
            </div>
          </div>
        )}

        {/* Fee breakdown */}
        {stakeAmount > 0 && (
          <div className="bg-bg rounded-lg p-3 space-y-2 border border-border">
            <div className="flex items-center gap-2 text-xs text-fg-muted">
              <Info className="w-3.5 h-3.5" />
              <span className="font-medium">Fee Breakdown</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-fg-muted">Stake:</span>
                <span className="font-medium tabular-nums">
                  {feeBreakdown.stake.toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-muted">Entry price:</span>
                <span className="font-medium tabular-nums">
                  {formatCents(feeBreakdown.entryPrice)}
                </span>
              </div>
              <div className="flex justify-between text-loss">
                <span>House fee (2%):</span>
                <span className="tabular-nums">
                  -{feeBreakdown.houseFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-loss">
                <span>Platform fee (1%):</span>
                <span className="tabular-nums">
                  -{feeBreakdown.platformFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-border">
                <span className="font-medium">Pool share:</span>
                <span className="font-medium text-profit tabular-nums">
                  +{feeBreakdown.poolShare.toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-border">
                <span className="font-medium">Potential payout:</span>
                <span className="font-semibold text-yes tabular-nums">
                  {potentialPayout.toFixed(2)} {currency}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Place Trade button */}
        <button
          type="submit"
          disabled={disabled || isLoading || stakeAmount <= 0}
          className={cn(
            'w-full h-12 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2',
            stakeAmount > 0 && !disabled
              ? 'bg-gradient-to-r from-brand to-brand-hover hover:brightness-110 text-fg shadow-[0_0_20px_rgba(99,102,241,0.25)]'
              : 'bg-bg-elevated text-fg-subtle cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowUpDown className="w-4 h-4" />
              {direction === 'buy' ? 'Buy' : 'Sell'}{' '}
              {isBinary ? binarySide : selectedOutcome.label} for{' '}
              {stakeAmount > 0 ? stakeAmount.toFixed(0) : '0'} {currency}
            </>
          )}
        </button>
        {/* Terms text */}
        <p className="text-2xs text-fg-subtle text-center leading-relaxed">
          By trading you agree to our{' '}
          <a href="/terms" className="text-brand hover:underline">Terms of Service</a>{' '}and{' '}
          <a href="/terms" className="text-brand hover:underline">Market Rules</a>
        </p>
      </form>
    </div>
  )
}

/* ────── Internal: Outcome button for multi-outcome markets ────── */

function OutcomeButton({
  outcome,
  selected,
  onClick,
  disabled,
}: {
  outcome: MarketOutcome
  selected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  const pct = Math.round(outcome.price * 100)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 w-full px-3 h-9 rounded-lg text-sm transition-all text-left',
        selected
          ? 'bg-brand-soft border border-brand/40 text-fg'
          : 'bg-bg border border-border text-fg-muted hover:text-fg hover:border-border-strong'
      )}
    >
      <span className="flex-1 truncate font-medium">{outcome.label}</span>
      <span className="tabular-nums font-semibold text-xs">{pct}%</span>
      <span className="text-2xs tabular-nums text-fg-subtle">{pct}¢</span>
    </button>
  )
}
