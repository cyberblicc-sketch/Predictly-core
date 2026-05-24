'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Zap,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Wallet,
  Building2,
  Gem,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { WithdrawalSpeed, WithdrawalFeeQuote } from '@/types'

// ── Speed Options ────────────────────────────────────────────────────────────

const SPEED_OPTIONS: {
  speed: WithdrawalSpeed
  label: string
  description: string
  icon: typeof Zap
  color: string
  bg: string
  border: string
}[] = [
  {
    speed: 'instant',
    label: 'Instant',
    description: 'Under 1 hour',
    icon: Zap,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  {
    speed: 'standard',
    label: 'Standard',
    description: '1-3 business days',
    icon: Clock,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  {
    speed: 'scheduled',
    label: 'Scheduled',
    description: '5-7 business days',
    icon: Calendar,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
]

// ── Props ────────────────────────────────────────────────────────────────────

interface WithdrawalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  balance?: number
}

// ── Component ────────────────────────────────────────────────────────────────

export function WithdrawalModal({
  open,
  onOpenChange,
  balance = 2500,
}: WithdrawalModalProps) {
  const [amount, setAmount] = useState('')
  const [speed, setSpeed] = useState<WithdrawalSpeed>('standard')
  const [destinationType, setDestinationType] = useState<'bank_account' | 'crypto_wallet'>('bank_account')
  const [destination, setDestination] = useState('')
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false)
  const [feeQuote, setFeeQuote] = useState<WithdrawalFeeQuote | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const numAmount = parseFloat(amount) || 0

  // Fetch fee quote when amount or speed changes
  const fetchFeeQuote = useCallback(async () => {
    if (numAmount <= 0) {
      setFeeQuote(null)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `/api/withdrawal/fee-quote?amount=${numAmount}&speed=${speed}`
      )
      if (res.ok) {
        const data = await res.json()
        setFeeQuote(data.quote)
      }
    } catch {
      // Silently fail — fee quote is optional UX
    } finally {
      setLoading(false)
    }
  }, [numAmount, speed])

  useEffect(() => {
    const timer = setTimeout(fetchFeeQuote, 300)
    return () => clearTimeout(timer)
  }, [fetchFeeQuote])

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setAmount('')
      setSpeed('standard')
      setDestinationType('bank_account')
      setDestination('')
      setShowFeeBreakdown(false)
      setFeeQuote(null)
    }
  }, [open])

  const handleSubmit = async () => {
    if (numAmount <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid withdrawal amount.', variant: 'destructive' })
      return
    }
    if (numAmount > balance) {
      toast({ title: 'Insufficient balance', description: `You only have ${balance.toLocaleString()} SC available.`, variant: 'destructive' })
      return
    }
    if (!destination.trim()) {
      toast({ title: 'Missing destination', description: 'Please enter a destination address or account.', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          speed,
          destination: destination.trim(),
          destination_type: destinationType,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: 'Withdrawal initiated',
          description: `${numAmount.toLocaleString()} SC withdrawal submitted. ${speed === 'instant' ? 'Arrives in under 1 hour.' : speed === 'standard' ? 'Arrives in 1-3 business days.' : 'Arrives in 5-7 business days.'}`,
        })
        onOpenChange(false)
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to process withdrawal.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const totalDeduction = feeQuote ? numAmount + feeQuote.fee : numAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Gem className="h-5 w-5 text-sweeps" />
            Withdraw Sweeps Coins
          </DialogTitle>
          <DialogDescription>
            Choose your withdrawal speed and destination. Faster withdrawals incur higher fees.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Balance & Amount */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Amount</Label>
              <span className="text-xs text-fg-muted">
                Balance: <strong className="text-fg">{balance.toLocaleString()} SC</strong>
              </span>
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 text-lg font-semibold pr-14 bg-bg-subtle border-border"
                min={0}
                max={balance}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-fg-muted">
                SC
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              {[
                { label: '25%', pct: 0.25 },
                { label: '50%', pct: 0.50 },
                { label: '75%', pct: 0.75 },
                { label: 'Max', pct: 1 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setAmount((balance * preset.pct).toFixed(2))}
                  className="flex-1 h-7 rounded-md bg-bg-subtle border border-border text-2xs font-medium text-fg-muted hover:text-fg hover:border-border-strong transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed Selector */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Withdrawal Speed</Label>
            <div className="grid grid-cols-3 gap-2">
              {SPEED_OPTIONS.map((opt) => {
                const isSelected = speed === opt.speed
                const Icon = opt.icon
                return (
                  <button
                    key={opt.speed}
                    onClick={() => setSpeed(opt.speed)}
                    className={cn(
                      'relative rounded-xl border p-3 text-center transition-all duration-200',
                      isSelected
                        ? `${opt.bg} ${opt.border} ring-2 ring-offset-1 ring-offset-bg`
                        : 'bg-bg-subtle border-border hover:border-border-strong'
                    )}
                  >
                    {opt.speed === 'instant' && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider">
                        Fastest
                      </span>
                    )}
                    <Icon className={cn('h-5 w-5 mx-auto mb-1.5', isSelected ? opt.color : 'text-fg-muted')} />
                    <div className={cn('text-sm font-semibold', isSelected ? opt.color : 'text-fg')}>
                      {opt.label}
                    </div>
                    <div className="text-2xs text-fg-muted mt-0.5">{opt.description}</div>
                    {feeQuote && numAmount > 0 && feeQuote.speed === opt.speed && (
                      <div className="mt-1.5 text-xs font-semibold tabular-nums">
                        {loading ? (
                          <Loader2 className="h-3 w-3 mx-auto animate-spin" />
                        ) : (
                          <span className={opt.color}>
                            {feeQuote.fee.toFixed(2)} SC fee
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fee Breakdown */}
          {feeQuote && numAmount > 0 && (
            <div className="rounded-xl bg-bg-subtle border border-border p-4">
              <button
                onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
                className="flex items-center justify-between w-full text-sm font-medium"
              >
                <span>Fee Breakdown</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-2xs tabular-nums">
                    {feeQuote.fee_pct}% fee
                  </Badge>
                  {showFeeBreakdown ? (
                    <ChevronUp className="h-4 w-4 text-fg-muted" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-fg-muted" />
                  )}
                </div>
              </button>

              {showFeeBreakdown && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-fg-muted">Base fee</span>
                    <span className="tabular-nums">{feeQuote.fee_breakdown.base_fee.toFixed(2)} SC</span>
                  </div>
                  {feeQuote.fee_breakdown.speed_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Speed fee</span>
                      <span className="tabular-nums">{feeQuote.fee_breakdown.speed_fee.toFixed(2)} SC</span>
                    </div>
                  )}
                  {feeQuote.fee_breakdown.risk_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Risk fee</span>
                      <span className="tabular-nums">{feeQuote.fee_breakdown.risk_fee.toFixed(2)} SC</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total fee</span>
                    <span className="tabular-nums">{feeQuote.fee_breakdown.total_fee.toFixed(2)} SC</span>
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-sm pt-3 border-t border-border">
                <span className="text-fg-muted">You receive</span>
                <span className="font-bold text-lg tabular-nums text-emerald-600 dark:text-emerald-400">
                  {feeQuote.net_amount.toFixed(2)} SC
                </span>
              </div>
            </div>
          )}

          {/* Destination */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Destination</Label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setDestinationType('bank_account')}
                className={cn(
                  'flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors',
                  destinationType === 'bank_account'
                    ? 'bg-brand-soft border-brand/30 text-brand-hover'
                    : 'bg-bg-subtle border-border text-fg-muted hover:border-border-strong'
                )}
              >
                <Building2 className="h-4 w-4" />
                Bank Account
              </button>
              <button
                onClick={() => setDestinationType('crypto_wallet')}
                className={cn(
                  'flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors',
                  destinationType === 'crypto_wallet'
                    ? 'bg-brand-soft border-brand/30 text-brand-hover'
                    : 'bg-bg-subtle border-border text-fg-muted hover:border-border-strong'
                )}
              >
                <Wallet className="h-4 w-4" />
                Crypto Wallet
              </button>
            </div>
            <Input
              placeholder={
                destinationType === 'bank_account'
                  ? 'e.g. Chase ****4821'
                  : 'e.g. 0x1a2b3c4d...9f8e'
              }
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="h-10 bg-bg-subtle border-border text-sm"
            />
          </div>

          {/* Disclaimer */}
          <div className="flex gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
            <AlertCircle className="shrink-0 h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p className="text-2xs text-amber-700 dark:text-amber-300 leading-relaxed">
              Withdrawals are final once submitted. Instant withdrawals carry higher fees
              due to immediate processing and float requirements. Standard and scheduled
              withdrawals benefit from lower fees.
            </p>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || numAmount <= 0 || !destination.trim() || numAmount > balance}
            className="w-full h-12 bg-gradient-to-r from-brand to-brand-hover hover:opacity-90 text-white font-semibold shadow-[0_0_20px_-4px_rgba(99,102,241,0.5)]"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Withdraw {feeQuote ? `${feeQuote.net_amount.toFixed(2)} SC` : `${numAmount.toLocaleString()} SC`}
                <span className="ml-2 opacity-80">
                  (Total: {feeQuote ? totalDeduction.toFixed(2) : numAmount.toFixed(2)} SC)
                </span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
