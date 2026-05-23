'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { formatCurrency } from '@/lib/utils'
import {
  Gift,
  Copy,
  CheckCircle2,
  Users,
  ArrowRight,
  Share2,
  Clock,
  DollarSign,
} from 'lucide-react'

// Mock referrals data
const referrals = [
  { id: '1', referred_username: 'NewTrader1', status: 'COMPLETED', reward_claimed: true, created_at: '2024-02-15', deposit: 10000 },
  { id: '2', referred_username: 'PredictionNewbie', status: 'COMPLETED', reward_claimed: true, created_at: '2024-02-10', deposit: 25000 },
  { id: '3', referred_username: 'CryptoLearner', status: 'PENDING', reward_claimed: false, created_at: '2024-02-20', deposit: 0 },
  { id: '4', referred_username: 'MarketBeginner', status: 'PENDING', reward_claimed: false, created_at: '2024-02-22', deposit: 0 },
]

const referralStats = {
  totalReferrals: 12,
  completedReferrals: 8,
  pendingReferrals: 4,
  totalEarned: 60000,
  pendingRewards: 8000,
}

const referralLink = 'https://supreme-fusion.com/ref/trader123'

export default function ReferralsPage() {
  const [copied, setCopied] = React.useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async (platform: string) => {
    const text = `Join Supreme Fusion Prediction Market and get bonus rewards! Use my referral link: ${referralLink}`
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
    } else if (platform === 'facebook') {
      window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referrals</h1>
        <p className="text-muted-foreground">Invite friends and earn rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{referralStats.totalReferrals}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-profit" />
              <span className="text-2xl font-bold">{referralStats.completedReferrals}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gold" />
              <span className="text-2xl font-bold text-gold">
                {formatCurrency(referralStats.totalEarned, 'GC')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-sweeps" />
              <span className="text-2xl font-bold text-sweeps">
                {formatCurrency(referralStats.pendingRewards, 'SC')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Earn 20 SC + 20,000 GOLD when your friend deposits!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={handleCopyLink} variant="outline">
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => handleShare('twitter')} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button onClick={() => handleShare('facebook')} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Facebook
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              More Options
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referral Rewards Info */}
      <Card className="bg-gradient-to-r from-sweeps/10 to-gold/10 border-primary/20">
        <CardHeader>
          <CardTitle>Referral Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-sweeps/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <div>
                <p className="font-bold text-lg">20 Sweeps Coins</p>
                <p className="text-sm text-muted-foreground">
                  When your friend completes their first deposit
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🪙</span>
              </div>
              <div>
                <p className="font-bold text-lg">20,000 Gold Coins</p>
                <p className="text-sm text-muted-foreground">
                  When your friend deposits any amount
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{referral.referred_username}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {referral.status === 'COMPLETED' ? (
                    <>
                      <div className="text-right">
                        <p className="font-medium text-profit">
                          +20 SC + 20K GC
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Deposit: {formatCurrency(referral.deposit, 'GC')}
                        </p>
                      </div>
                      <Badge variant="success">Completed</Badge>
                    </>
                  ) : (
                    <>
                      <div className="text-right">
                        <p className="font-medium text-muted-foreground">Pending</p>
                        <p className="text-sm text-muted-foreground">Awaiting deposit</p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Disclaimer />
    </div>
  )
}