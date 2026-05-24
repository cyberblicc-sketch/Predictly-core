'use client'

import { useState, useMemo } from 'react'
import {
  ArrowDownToLine,
  Zap,
  Clock,
  CalendarClock,
  Gem,
  AlertTriangle,
  Info,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Banknote,
  Wallet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { cn, formatDate } from '@/lib/utils'
import { mockUser } from '@/lib/mockData'
import type { WithdrawalSpeed, WithdrawalFeeQuote, WithdrawalRequest } from '@/types'

// ── Speed Tier Config ──────────────────────────────────────────────────────

const SPEED_TIERS: {
  speed: WithdrawalSpeed
  name: string
  icon: React.ElementType
  description: string
  feePct: number
  estimatedArrival: string
  color: string
  borderColor: string
  iconColor: string
  gradient: string
}[] = [
  {
    speed: 'instant',
    name: 'Instant',
    icon: Zap,
    description: 'For urgent redemptions when you need funds immediately. Processed within minutes.',
    feePct: 5,
    estimatedArrival: '1–5 minutes',
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-500',
    gradient: 'from-amber-600 to-orange-600',
  },
  {
    speed: 'standard',
    name: 'Standard',
    icon: Clock,
    description: 'Standard processing with a reasonable fee. Best balance of speed and cost.',
    feePct: 2,
    estimatedArrival: '1–3 business days',
    color: 'from-sky-500/20 to-cyan-500/20',
    borderColor: 'border-sky-500/30',
    iconColor: 'text-sky-500',
    gradient: 'from-sky-600 to-cyan-600',
  },
  {
    speed: 'scheduled',
    name: 'Scheduled',
    icon: CalendarClock,
    description: 'Lowest cost option with batched processing. Ideal for non-urgent redemptions.',
    feePct: 0.5,
    estimatedArrival: '5–7 business days',
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-500',
    gradient: 'from-emerald-600 to-teal-600',
  },
]

// ── Mock Recent Withdrawals ────────────────────────────────────────────────

const RECENT_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'w1',
    user_id: 'u1',
    amount: 500,
    currency: 'SC',
    speed: 'standard',
    fee: 10,
    net_amount: 490,
    status: 'completed',
    destination: '••••4821',
    destination_type: 'bank_account',
    estimated_arrival: '1–3 business days',
    created_at: '2026-03-01T10:20:00Z',
    processed_at: '2026-03-03T09:15:00Z',
  },
  {
    id: 'w2',
    user_id: 'u1',
    amount: 200,
    currency: 'SC',
    speed: 'instant',
    fee: 10,
    net_amount: 190,
    status: 'completed',
    destination: '0x7f3...a9c2',
    destination_type: 'crypto_wallet',
    estimated_arrival: '1–5 minutes',
    created_at: '2026-02-20T14:30:00Z',
    processed_at: '2026-02-20T14:32:00Z',
  },
  {
    id: 'w3',
    user_id: 'u1',
    amount: 1000,
    currency: 'SC',
    speed: 'scheduled',
    fee: 5,
    net_amount: 995,
    status: 'processing',
    destination: '••••4821',
    destination_type: 'bank_account',
    estimated_arrival: '5–7 business days',
    created_at: '2026-03-09T08:00:00Z',
    processed_at: null,
  },
  {
    id: 'w4',
    user_id: 'u1',
    amount: 300,
    currency: 'SC',
    speed: 'standard',
    fee: 6,
    net_amount: 294,
    status: 'pending',
    destination: '0x2b1...d4e7',
    destination_type: 'crypto_wallet',
    estimated_arrival: '1–3 business days',
    created_at: '2026-03-10T16:45:00Z',
    processed_at: null,
  },
]

// ── Withdrawal Page ────────────────────────────────────────────────────────

export default function WithdrawalPage() {
  const [selectedSpeed, setSelectedSpeed] = useState<WithdrawalSpeed>('standard')
  const [amount, setAmount] = useState('')
  const [destinationType, setDestinationType] = useState<'bank_account' | 'crypto_wallet'>('bank_account')
  const [destination, setDestination] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showHistory, setShowHistory] = useState(true)

  const { toast } = useToast()
  const scBalance = mockUser.sweeps_balance

  // Fee calculation
  const quote = useMemo((): WithdrawalFeeQuote | null => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0 || amt > scBalance) return null

    const tier = SPEED_TIERS.find((t) => t.speed === selectedSpeed)!
    const feePct = tier.feePct / 100
    const baseFee = 0.5
    const speedFee = amt * feePct
    const riskFee = destinationType === 'crypto_wallet' ? amt * 0.003 : 0
    const totalFee = baseFee + speedFee + riskFee

    return {
      amount: amt,
      currency: 'SC',
      speed: selectedSpeed,
      fee: totalFee,
      fee_pct: (totalFee / amt) * 100,
      net_amount: amt - totalFee,
      estimated_arrival: tier.estimatedArrival,
      fee_breakdown: {
        base_fee: baseFee,
        speed_fee: speedFee,
        risk_fee: riskFee,
        total_fee: totalFee,
      },
    }
  }, [amount, selectedSpeed, destinationType, scBalance])

  const handleSubmit = () => {
    if (!quote || !destination) {
      toast({
        title: 'Missing information',
        description: 'Please enter a valid amount and destination.',
        variant: 'destructive',
      })
      return
    }

    if (quote.net_amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'The fee exceeds the withdrawal amount.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      toast({
        title: 'Withdrawal submitted',
        description: `${quote.amount} SC withdrawal to ${destinationType === 'bank_account' ? 'bank account' : 'crypto wallet'} is being processed. Estimated arrival: ${quote.estimated_arrival}.`,
      })
      setAmount('')
      setDestination('')
    }, 1500)
  }

  const handleMaxAmount = () => {
    setAmount(scBalance.toString())
  }

  return (
    <div className="space-y-6 pb-8">
      {/* ═══════════ Header ═══════════ */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 border border-sky-500/30 flex items-center justify-center">
            <ArrowDownToLine className="h-5 w-5 text-sky-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Withdrawal Center</h1>
            <p className="text-sm text-fg-muted">Redeem your Sweepstakes Coins (SC) with flexible speed options</p>
          </div>
        </div>
      </div>

      {/* ═══════════ Balance Card ═══════════ */}
      <Card className="glass border border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-cyan-500/5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 border border-sky-500/30 flex items-center justify-center">
                <Gem className="h-6 w-6 text-sky-500" />
              </div>
              <div>
                <div className="text-2xs text-fg-muted uppercase tracking-wider">Available SC Balance</div>
                <div className="text-3xl font-bold tabular-nums gradient-text">
                  {scBalance.toLocaleString()} <span className="text-lg">SC</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={cn(
                'text-xs',
                mockUser.kyc_status === 'approved'
                  ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                  : mockUser.kyc_status === 'pending'
                    ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-600 border-rose-500/30'
              )}>
                {mockUser.kyc_status === 'approved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                KYC {mockUser.kyc_status.charAt(0).toUpperCase() + mockUser.kyc_status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════ Speed Tier Cards ═══════════ */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Select Speed</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {SPEED_TIERS.map((tier) => {
            const Icon = tier.icon
            const isSelected = selectedSpeed === tier.speed
            return (
              <button
                key={tier.speed}
                onClick={() => setSelectedSpeed(tier.speed)}
                className={cn(
                  'relative rounded-xl border p-4 text-left transition-all duration-200',
                  isSelected
                    ? `bg-gradient-to-br ${tier.color} ring-2 ring-offset-1 ring-offset-bg ${tier.borderColor}`
                    : 'bg-bg-subtle border-border hover:border-border-strong'
                )}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={cn(
                    'h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center border',
                    tier.color, tier.borderColor
                  )}>
                    <Icon className={cn('h-4 w-4', tier.iconColor)} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{tier.name}</div>
                    <div className="text-2xs text-fg-muted">{tier.estimatedArrival}</div>
                  </div>
                </div>
                <p className="text-2xs text-fg-muted mb-3 leading-relaxed">{tier.description}</p>
                <div className="flex items-center justify-between">
                  <div className="rounded-md bg-bg/50 border border-border px-2 py-1">
                    <span className="text-sm font-bold tabular-nums">{tier.feePct}%</span>
                    <span className="text-2xs text-fg-muted ml-1">fee</span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className={cn('h-5 w-5', tier.iconColor)} />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ═══════════ Withdrawal Form ═══════════ */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Withdrawal Details</h2>
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-5 space-y-5">
            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Amount (SC)</label>
                <button
                  onClick={handleMaxAmount}
                  className="text-2xs text-sky-500 hover:text-sky-400 font-medium transition-colors"
                >
                  Max: {scBalance.toLocaleString()} SC
                </button>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11 bg-bg border-border pr-12 text-lg font-semibold tabular-nums"
                  min={0}
                  max={scBalance}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-fg-muted">
                  SC
                </div>
              </div>
              {parseFloat(amount) > scBalance && (
                <p className="text-2xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Exceeds available balance
                </p>
              )}
            </div>

            {/* Destination Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Destination</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDestinationType('bank_account')}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border p-3 transition-all',
                    destinationType === 'bank_account'
                      ? 'bg-sky-500/10 border-sky-500/30 ring-1 ring-sky-500/20'
                      : 'bg-bg border-border hover:border-border-strong'
                  )}
                >
                  <Banknote className={cn(
                    'h-5 w-5',
                    destinationType === 'bank_account' ? 'text-sky-500' : 'text-fg-muted'
                  )} />
                  <div className="text-left">
                    <div className="text-xs font-semibold">Bank Account</div>
                    <div className="text-2xs text-fg-muted">ACH transfer</div>
                  </div>
                </button>
                <button
                  onClick={() => setDestinationType('crypto_wallet')}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border p-3 transition-all',
                    destinationType === 'crypto_wallet'
                      ? 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20'
                      : 'bg-bg border-border hover:border-border-strong'
                  )}
                >
                  <Wallet className={cn(
                    'h-5 w-5',
                    destinationType === 'crypto_wallet' ? 'text-amber-500' : 'text-fg-muted'
                  )} />
                  <div className="text-left">
                    <div className="text-xs font-semibold">Crypto Wallet</div>
                    <div className="text-2xs text-fg-muted">USDC / USDT</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Destination Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {destinationType === 'bank_account' ? 'Bank Account Details' : 'Wallet Address'}
              </label>
              <Input
                placeholder={destinationType === 'bank_account' ? 'Enter bank account or routing number' : '0x...'}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="h-10 bg-bg border-border"
              />
            </div>

            {/* Fee Calculator */}
            {quote && (
              <div className="rounded-xl border border-border bg-bg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="h-4 w-4 text-sky-500" />
                  <span className="text-sm font-semibold">Fee Breakdown</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-fg-muted">Withdrawal amount</span>
                    <span className="tabular-nums font-medium">{quote.amount.toLocaleString()} SC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fg-muted">Base fee</span>
                    <span className="tabular-nums">{quote.fee_breakdown.base_fee.toFixed(2)} SC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fg-muted">
                      Speed fee ({SPEED_TIERS.find((t) => t.speed === selectedSpeed)?.feePct}%)
                    </span>
                    <span className="tabular-nums">{quote.fee_breakdown.speed_fee.toFixed(2)} SC</span>
                  </div>
                  {quote.fee_breakdown.risk_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Crypto processing fee (0.3%)</span>
                      <span className="tabular-nums">{quote.fee_breakdown.risk_fee.toFixed(2)} SC</span>
                    </div>
                  )}
                  <Separator className="bg-border" />
                  <div className="flex justify-between font-semibold">
                    <span>Total fee ({quote.fee_pct.toFixed(2)}%)</span>
                    <span className="tabular-nums text-rose-500">-{quote.fee.toFixed(2)} SC</span>
                  </div>
                  <div className="flex justify-between font-bold text-base">
                    <span>Net amount</span>
                    <span className="tabular-nums text-emerald-500">{quote.net_amount.toFixed(2)} SC</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-2xs text-fg-muted bg-bg-subtle rounded-lg p-2.5 border border-border">
                  <Clock className="shrink-0 h-3.5 w-3.5" />
                  Estimated arrival: {quote.estimated_arrival}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || quote.net_amount <= 0 || !destination}
                  className={cn(
                    'w-full h-11 font-semibold text-white',
                    `bg-gradient-to-r ${SPEED_TIERS.find((t) => t.speed === selectedSpeed)?.gradient || 'from-sky-600 to-cyan-600'} hover:opacity-90`
                  )}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Withdraw {quote.net_amount.toFixed(2)} SC
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══════════ Recent Withdrawals ═══════════ */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-lg font-semibold mb-3 w-full"
        >
          Recent Withdrawals
          {showHistory ? <ChevronUp className="h-4 w-4 text-fg-muted" /> : <ChevronDown className="h-4 w-4 text-fg-muted" />}
        </button>
        {showHistory && (
          <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-2xs text-fg-subtle uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Amount</th>
                    <th className="text-left px-4 py-3 font-medium">Speed</th>
                    <th className="text-right px-4 py-3 font-medium">Fee</th>
                    <th className="text-right px-4 py-3 font-medium">Net</th>
                    <th className="text-left px-4 py-3 font-medium">Destination</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {RECENT_WITHDRAWALS.map((w) => (
                    <tr key={w.id} className="hover:bg-bg-elevated transition-colors">
                      <td className="px-4 py-3 text-fg-muted tabular-nums whitespace-nowrap">{formatDate(w.created_at)}</td>
                      <td className="px-4 py-3 font-medium tabular-nums">{w.amount.toLocaleString()} SC</td>
                      <td className="px-4 py-3">
                        <Badge className={cn(
                          'text-2xs',
                          w.speed === 'instant'
                            ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                            : w.speed === 'standard'
                              ? 'bg-sky-500/15 text-sky-600 border-sky-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                        )}>
                          {w.speed.charAt(0).toUpperCase() + w.speed.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-fg-muted tabular-nums">-{w.fee.toFixed(2)} SC</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-emerald-500">{w.net_amount.toFixed(2)} SC</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-fg-muted">
                          {w.destination_type === 'bank_account' ? (
                            <Banknote className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <Wallet className="h-3.5 w-3.5 shrink-0" />
                          )}
                          <span className="truncate max-w-[100px]">{w.destination}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={cn(
                          'text-2xs',
                          w.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                            : w.status === 'processing'
                              ? 'bg-sky-500/15 text-sky-600 border-sky-500/30'
                              : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                        )}>
                          {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ KYC Disclaimer ═══════════ */}
      <Card className="bg-bg-subtle border border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertTriangle className="shrink-0 h-5 w-5 text-amber-500 mt-0.5" />
            <div className="space-y-2">
              <div className="text-sm font-semibold">KYC Verification Required</div>
              <p className="text-xs text-fg-muted leading-relaxed">
                All SC withdrawals require KYC (Know Your Customer) verification in compliance with anti-money laundering
                regulations. Your identity must be verified before any redemption request can be processed.
                Processing times are estimates and may vary based on verification status and transaction volume.
              </p>
              <div className="flex items-center gap-4 text-xs text-fg-muted">
                <span className="flex items-center gap-1">
                  <Banknote className="h-3.5 w-3.5" />
                  Min withdrawal: 10 SC
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Processing: Mon–Fri
                </span>
                <span className="flex items-center gap-1">
                  <Gem className="h-3.5 w-3.5" />
                  SC only (GC not redeemable)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
