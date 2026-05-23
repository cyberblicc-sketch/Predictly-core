'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, calculatePnl } from '@/lib/utils'
import type { Position, Market } from '@/types'
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'

interface PositionCardProps {
  position: Position
  onExit?: (positionId: string) => Promise<void>
  onViewMarket?: (marketId: string) => void
}

export function PositionCard({ position, onExit, onViewMarket }: PositionCardProps) {
  const [isExiting, setIsExiting] = React.useState(false)

  const pnl = calculatePnl(
    position.entry_price,
    position.current_price,
    position.stake,
    position.side
  )

  const isProfitable = pnl > 0
  const isLosing = pnl < 0
  const isResolved = position.market?.resolved

  const handleExit = async () => {
    if (!onExit) return
    setIsExiting(true)
    try {
      await onExit(position.id)
    } catch (error) {
      console.error('Exit failed:', error)
    } finally {
      setIsExiting(false)
    }
  }

  return (
    <Card className={cn(
      'transition-colors',
      isProfitable && 'border-profit/50',
      isLosing && 'border-loss/50'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Badge variant={position.side === 'YES' ? 'success' : 'danger'} className="mb-2">
              {position.side}
            </Badge>
            <button
              onClick={() => onViewMarket?.(position.market_id)}
              className="text-left hover:text-primary transition-colors"
            >
              <CardTitle className="text-base line-clamp-2">
                {position.market?.title || 'Loading...'}
              </CardTitle>
            </button>
          </div>
          {position.market && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewMarket?.(position.market_id)}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Entry Price</p>
            <p className="text-lg font-bold">{(position.entry_price * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-lg font-bold">{(position.current_price * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Stake</p>
            <p className="text-lg font-bold">{formatCurrency(position.stake, 'GC')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">P&L</p>
            <div className="flex items-center gap-1">
              {isProfitable ? (
                <TrendingUp className="w-4 h-4 text-profit" />
              ) : isLosing ? (
                <TrendingDown className="w-4 h-4 text-loss" />
              ) : null}
              <p className={cn(
                'text-lg font-bold',
                isProfitable && 'text-profit',
                isLosing && 'text-loss'
              )}>
                {isProfitable ? '+' : ''}{formatCurrency(pnl, 'GC')}
              </p>
            </div>
          </div>
        </div>

        {!isResolved && (
          <div className={`p-3 rounded-lg ${isProfitable ? 'bg-profit/10' : isLosing ? 'bg-loss/10' : 'bg-muted'}`}>
            <p className="text-sm">
              {isProfitable
                ? 'Your position is in profit!'
                : isLosing
                ? 'Your position is at a loss.'
                : 'Break even'}
            </p>
          </div>
        )}

        {isResolved && (
          <Badge variant={position.market?.resolution === position.side ? 'success' : 'danger'}>
            {position.market?.resolution === position.side ? 'Won' : 'Lost'}
          </Badge>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onViewMarket?.(position.market_id)}
        >
          View Market
        </Button>
        {!isResolved && onExit && (
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleExit}
            disabled={isExiting}
          >
            {isExiting ? 'Exiting...' : 'Exit Position'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}