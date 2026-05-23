'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { FeeBreakdown, Currency } from '@/types'
import { Loader2, Info } from 'lucide-react'

interface TradeFormProps {
  marketId: string
  currentOdds: { yes: number; no: number }
  onTrade: (side: 'YES' | 'NO', amount: number, currency: Currency) => Promise<void>
  disabled?: boolean
}

export function TradeForm({ marketId, currentOdds, onTrade, disabled }: TradeFormProps) {
  const [side, setSide] = React.useState<'YES' | 'NO'>('YES')
  const [stake, setStake] = React.useState('')
  const [currency, setCurrency] = React.useState<Currency>('GC')
  const [isLoading, setIsLoading] = React.useState(false)

  const stakeAmount = parseFloat(stake) || 0
  const houseFeeRate = 0.02
  const platformFeeRate = 0.01

  const feeBreakdown: FeeBreakdown = React.useMemo(() => {
    const houseFee = stakeAmount * houseFeeRate
    const platformFee = stakeAmount * platformFeeRate
    const poolShare = stakeAmount - houseFee - platformFee
    const entryPrice = side === 'YES' ? currentOdds.yes : currentOdds.no

    return {
      stake: stakeAmount,
      houseFee,
      platformFee,
      poolShare,
      entryPrice,
    }
  }, [stakeAmount, side, currentOdds])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (stakeAmount <= 0) return

    setIsLoading(true)
    try {
      await onTrade(side, stakeAmount, currency)
      setStake('')
    } catch (error) {
      console.error('Trade failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Place Trade
          <Badge variant={side === 'YES' ? 'success' : 'danger'}>
            {side}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={side === 'YES' ? 'success' : 'outline'}
              className="flex-1"
              onClick={() => setSide('YES')}
              disabled={disabled}
            >
              YES
            </Button>
            <Button
              type="button"
              variant={side === 'NO' ? 'danger' : 'outline'}
              className="flex-1"
              onClick={() => setSide('NO')}
              disabled={disabled}
            >
              NO
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stake Amount</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter amount"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                min="0"
                step="0.01"
                disabled={disabled}
                className="flex-1"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                disabled={disabled}
              >
                <option value="GC">🪙 GC</option>
                <option value="SC">💎 SC</option>
              </select>
            </div>
          </div>

          {stakeAmount > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4" />
                <span>Fee Breakdown</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>You stake:</span>
                  <span className="font-medium">{feeBreakdown.stake.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entry price:</span>
                  <span className="font-medium">{(feeBreakdown.entryPrice * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-loss">
                  <span>House keeps (2%):</span>
                  <span>-{feeBreakdown.houseFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-loss">
                  <span>Platform keeps (1%):</span>
                  <span>-{feeBreakdown.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between col-span-2 border-t pt-2 mt-2">
                  <span>Into pool:</span>
                  <span className="font-medium text-profit">+{feeBreakdown.poolShare.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={disabled || isLoading || stakeAmount <= 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {side === 'YES' ? 'Buy YES' : 'Buy NO'} for {stakeAmount.toFixed(2)} {currency}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}