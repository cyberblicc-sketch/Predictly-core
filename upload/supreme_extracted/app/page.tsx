import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MarketCard } from '@/components/market/MarketCard'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { formatCurrency } from '@/lib/utils'
import {
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  Gift,
  Trophy,
  Zap,
  AlertTriangle,
} from 'lucide-react'

// Mock data
const stats = {
  totalVolume: 2847293,
  activeMarkets: 127,
  totalUsers: 45231,
  totalPayout: 1247893,
}

const featuredMarkets = [
  {
    id: 'stock-1',
    title: 'Will AAPL exceed $200 by end of Q2 2025?',
    category: 'Stocks',
    close_date: '2025-06-30',
    resolved: false,
    yes_price: 0.45,
    no_price: 0.55,
    volume: 89000,
    participants: 2156,
    created_at: '2025-01-15',
  },
  {
    id: '1',
    title: 'Will AI pass the Turing test by 2025?',
    category: 'Technology',
    close_date: '2025-12-31',
    resolved: false,
    yes_price: 0.65,
    no_price: 0.35,
    volume: 125000,
    participants: 3421,
    created_at: '2024-01-15',
  },
  {
    id: '2',
    title: 'Will SpaceX land humans on Mars before 2030?',
    category: 'Space',
    close_date: '2029-12-31',
    resolved: false,
    yes_price: 0.42,
    no_price: 0.58,
    volume: 89000,
    participants: 2156,
    created_at: '2024-02-01',
  },
  {
    id: '3',
    title: 'Will Bitcoin exceed $100,000 in 2025?',
    category: 'Crypto',
    close_date: '2025-12-31',
    resolved: false,
    yes_price: 0.78,
    no_price: 0.22,
    volume: 256000,
    participants: 5847,
    created_at: '2024-01-20',
  },
  {
    id: 'stock-2',
    title: 'Will TSLA stock price double in 2025?',
    category: 'Stocks',
    close_date: '2025-12-31',
    resolved: false,
    yes_price: 0.35,
    no_price: 0.65,
    volume: 156000,
    participants: 4230,
    created_at: '2025-02-01',
  },
  {
    id: 'stock-3',
    title: 'Will NVDA be the most valuable semiconductor company by Q4 2025?',
    category: 'Stocks',
    close_date: '2025-09-30',
    resolved: false,
    yes_price: 0.62,
    no_price: 0.38,
    volume: 98000,
    participants: 2890,
    created_at: '2025-01-20',
  },
]

const recentActivity = [
  { type: 'trade', user: 'CryptoKing', amount: 500, side: 'YES', market: 'Bitcoin $100k' },
  { type: 'win', user: 'PredictionPro', amount: 1200, market: 'AI Turing Test' },
  { type: 'deposit', user: 'NewTrader', amount: 10000, currency: 'SC' },
  { type: 'referral', user: 'TopTrader', amount: 5000, currency: 'GC' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Supreme Fusion <span className="text-primary">Prediction Market</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Trade on real-world events with Gold Coins and Sweeps Coins. 
              Predict the future, win rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/markets">Browse Markets</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="border-y bg-card py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{formatCurrency(stats.totalVolume, 'GC')}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Volume</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{stats.activeMarkets}</span>
              </div>
              <p className="text-sm text-muted-foreground">Active Markets</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">Traders</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{formatCurrency(stats.totalPayout, 'GC')}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Paid Out</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Trade Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Buy YES or NO shares on real-world events. Prices reflect the probability 
                  of outcomes, moving based on market activity.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-sweeps/10 rounded-lg flex items-center justify-center mb-4">
                  <Gift className="w-6 h-6 text-sweeps" />
                </div>
                <CardTitle>Dual Currency System</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  <span className="text-gold font-medium">Gold Coins (GC)</span> - Purchased currency for active trading.
                  <br />
                  <span className="text-sweeps font-medium">Sweeps Coins (SC)</span> - Free promotional currency for contests and prizes.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-profit/10 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-profit" />
                </div>
                <CardTitle>Win Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Correct predictions pay out based on the final odds. 
                  Redeem Sweeps Coins for gift cards (KYC required, min. 50 SC).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 1% Profit Opportunity */}
      <section className="py-16 px-4 bg-gradient-to-b from-emerald-900/20 to-transparent">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="success" className="mb-4">Limited Time Opportunity</Badge>
              <h2 className="text-3xl font-bold mb-4">1% Profit on Serious Market Predictions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore prediction cards with strong market indicators. Each card represents a real-world event with proven profit potential. Not all ideas will be implemented — but the best ones will.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-emerald-900/20 border-emerald-700/30">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-400 mb-1">AAPL</p>
                  <p className="text-sm text-muted-foreground mb-2">Apple Stock</p>
                  <p className="text-xs text-emerald-300">Predict if AAPL exceeds $200 by Q2</p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-900/20 border-emerald-700/30">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-400 mb-1">BTC</p>
                  <p className="text-sm text-muted-foreground mb-2">Bitcoin</p>
                  <p className="text-xs text-emerald-300">Will BTC exceed $100k in 2025?</p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-900/20 border-emerald-700/30">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-400 mb-1">TSLA</p>
                  <p className="text-sm text-muted-foreground mb-2">Tesla</p>
                  <p className="text-xs text-emerald-300">Will TSLA double in 2025?</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-200 mb-1">Disclaimer</p>
                  <p className="text-sm text-amber-300/80">
                    This is a prediction market simulation for entertainment purposes. Not all market ideas shown will be implemented. Past performance does not guarantee future results. Staking involves risk of loss. 18+ only. Users must complete KYC verification before redeeming any winnings.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/markets">
                  Start Trading Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Markets */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Markets</h2>
            <Button variant="outline" asChild>
              <Link href="/markets">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <Card key={i}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'win' ? 'bg-profit/20' :
                      activity.type === 'trade' ? 'bg-primary/20' :
                      activity.type === 'deposit' ? 'bg-sweeps/20' :
                      'bg-gold/20'
                    }`}>
                      {activity.type === 'win' && <Trophy className="w-5 h-5 text-profit" />}
                      {activity.type === 'trade' && <TrendingUp className="w-5 h-5 text-primary" />}
                      {activity.type === 'deposit' && <DollarSign className="w-5 h-5 text-sweeps" />}
                      {activity.type === 'referral' && <Gift className="w-5 h-5 text-gold" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {activity.user}
                        <span className="text-muted-foreground"> - {activity.type}</span>
                        {' on '}
                        {activity.market}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.side && <Badge variant={activity.side === 'YES' ? 'success' : 'danger'} className="mr-2">{activity.side}</Badge>}
                        {formatCurrency(activity.amount, activity.currency as 'GC' | 'SC' || 'GC')}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">2m ago</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of traders predicting the future. 
            Sign up today and get bonus Sweeps Coins to start.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Supreme Fusion</h3>
              <p className="text-sm text-muted-foreground">
                The premier prediction market for trading on real-world events.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Markets</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/markets?category=technology" className="hover:text-foreground">Technology</Link></li>
                <li><Link href="/markets?category=politics" className="hover:text-foreground">Politics</Link></li>
                <li><Link href="/markets?category=sports" className="hover:text-foreground">Sports</Link></li>
                <li><Link href="/markets?category=crypto" className="hover:text-foreground">Crypto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/faq" className="hover:text-foreground">FAQ</Link></li>
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
              </ul>
            </div>
          </div>

          <Disclaimer className="mb-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; 2024 Supreme Fusion. All rights reserved.</p>
            <p>21+ | AMOE | No Purchase Necessary</p>
          </div>
        </div>
      </footer>
    </div>
  )
}