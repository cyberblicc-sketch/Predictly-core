'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate, timeAgo } from '@/lib/utils'
import { Share2, Users, Clock, TrendingUp, AlertTriangle, Flag } from 'lucide-react'
import type { Market } from '@/types'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalClose
} from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

interface MarketCardProps {
  market: Market
  showProfitLoss?: boolean
  userPosition?: { side: 'YES' | 'NO'; pnl: number }
}

export function MarketCard({ market, showProfitLoss, userPosition }: MarketCardProps) {
  const [isShareLoading, setIsShareLoading] = React.useState(false)
  const [fraudModalOpen, setFraudModalOpen] = React.useState(false)
  const [fraudDescription, setFraudDescription] = React.useState('')
  const [fraudType, setFraudType] = React.useState('suspicious_activity')
  const [submitting, setSubmitting] = React.useState(false)

  const handleShare = async () => {
    setIsShareLoading(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: market.title,
          text: `I just staked on "${market.title}"! Predict the future at Supreme Fusion 🏆`,
          url: window.location.origin + `/markets/${market.id}`,
        })
      } else {
        await navigator.clipboard.writeText(window.location.origin + `/markets/${market.id}`)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      // User cancelled share
    } finally {
      setIsShareLoading(false)
    }
  }

  const handleFraudReport = async () => {
    if (!fraudDescription.trim()) {
      alert('Please describe the issue')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/fraud-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: fraudType,
          market_id: market.id,
          description: fraudDescription,
        }),
      })

      if (res.ok) {
        alert('Report submitted. Our team will review it shortly.')
        setFraudModalOpen(false)
        setFraudDescription('')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to submit report')
      }
    } catch {
      alert('Failed to submit report')
    }
    setSubmitting(false)
  }

  const isProfitable = userPosition && userPosition.pnl > 0
  const isLosing = userPosition && userPosition.pnl < 0

  return (
    <>
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Badge variant="outline" className="mb-2">
                {market.category}
              </Badge>
              <Link href={`/markets/${market.id}`}>
                <CardTitle className="text-lg hover:text-primary transition-colors line-clamp-2">
                  {market.title}
                </CardTitle>
              </Link>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                disabled={isShareLoading}
                title="Share market"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFraudModalOpen(true)}
                title="Report issue"
                className="text-slate-500 hover:text-red-400"
              >
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">YES</p>
              <p className="text-2xl font-bold text-profit">
                {formatCurrency(market.yes_price, 'GC')}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">NO</p>
              <p className="text-2xl font-bold text-loss">
                {formatCurrency(market.no_price, 'GC')}
              </p>
            </div>
          </div>

          {showProfitLoss && userPosition && (
            <div className={`p-3 rounded-lg ${isProfitable ? 'bg-profit/10' : isLosing ? 'bg-loss/10' : 'bg-muted'}`}>
              <p className="text-sm text-muted-foreground">Your Position</p>
              <p className={`text-lg font-bold ${isProfitable ? 'text-profit' : isLosing ? 'text-loss' : ''}`}>
                {userPosition.side} • {isProfitable ? '+' : ''}{formatCurrency(userPosition.pnl, 'GC')}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{market.participants.toLocaleString()} traders</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{formatCurrency(market.volume, 'GC')} volume</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Clock className="w-4 h-4" />
            <span>{market.resolved ? 'Resolved' : timeAgo(market.close_date)}</span>
          </div>
        </CardFooter>
      </Card>

      <Modal open={fraudModalOpen} onOpenChange={setFraudModalOpen}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Report Issue
            </ModalTitle>
            <ModalDescription>
              Report suspicious activity or issues with &quot;{market.title}&quot;
            </ModalDescription>
          </ModalHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="fraud-type">Issue Type</Label>
              <select
                id="fraud-type"
                value={fraudType}
                onChange={(e) => setFraudType(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="market_manipulation">Market Manipulation</option>
                <option value="unfair_payout">Unfair Payout</option>
                <option value="spam">Spam</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="fraud-desc">Description</Label>
              <textarea
                id="fraud-desc"
                value={fraudDescription}
                onChange={(e) => setFraudDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white min-h-[100px]"
              />
            </div>
            <Button
              onClick={handleFraudReport}
              disabled={submitting || !fraudDescription.trim()}
              className="w-full"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
          <ModalClose />
        </ModalContent>
      </Modal>
    </>
  )
}