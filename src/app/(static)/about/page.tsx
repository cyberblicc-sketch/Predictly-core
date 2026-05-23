'use client'

import Link from 'next/link'
import {
  LayoutDashboard, Globe, Shield, Zap, Users, TrendingUp,
  Target, Award, ArrowRight, Check, Star, Newspaper,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const TEAM_MEMBERS = [
  {
    name: 'Alex Rivera',
    role: 'CEO & Co-Founder',
    bio: 'Former quantitative trader at Goldman Sachs with 12 years of experience in prediction markets and financial derivatives. Alex holds an MBA from Wharton and has been featured in Forbes 30 Under 30 for fintech innovation.',
    avatar: 'AR',
    color: 'from-brand to-sweeps',
  },
  {
    name: 'Sarah Chen',
    role: 'CTO & Co-Founder',
    bio: 'Previously a senior engineer at Stripe and Google, Sarah brings deep expertise in distributed systems and real-time trading infrastructure. She holds a PhD in Computer Science from MIT with a focus on consensus algorithms.',
    avatar: 'SC',
    color: 'from-yes to-brand',
  },
  {
    name: 'Marcus Johnson',
    role: 'Head of Product',
    bio: 'With a background in game design at Electronic Arts and product leadership at Robinhood, Marcus focuses on creating engaging, intuitive experiences that make prediction markets accessible to everyone.',
    avatar: 'MJ',
    color: 'from-warn to-yes',
  },
  {
    name: 'Dr. Priya Patel',
    role: 'Head of Research & AI',
    bio: 'A former research scientist at DeepMind, Priya leads our AI swarm technology and market intelligence systems. She holds a PhD in Machine Learning from Stanford and has published over 30 papers on predictive modeling.',
    avatar: 'PP',
    color: 'from-sweeps to-no',
  },
]

const STATS = [
  { label: 'Active Traders', value: '250K+', icon: Users },
  { label: 'Markets Created', value: '12,000+', icon: Target },
  { label: 'Trading Volume', value: '$890M+', icon: TrendingUp },
  { label: 'Countries', value: '45+', icon: Globe },
]

const DIFFERENCES = [
  {
    feature: 'Currency System',
    traditional: 'Single currency, real-money only',
    predictly: 'Dual-currency (GC for fun, SC for prizes) with free entry via AMOE',
    icon: Zap,
  },
  {
    feature: 'Market Creation',
    traditional: 'Centralized, slow approval process',
    predictly: 'Community-driven with AI-assisted safety scoring and instant publishing',
    icon: Target,
  },
  {
    feature: 'Resolution',
    traditional: 'Manual, opaque resolution process',
    predictly: 'Transparent resolution with verifiable sources and evidence tracking',
    icon: Shield,
  },
  {
    feature: 'Accessibility',
    traditional: 'Limited jurisdictions, high minimums',
    predictly: 'Global access, low entry barriers, free Sweeps Coins via AMOE',
    icon: Globe,
  },
  {
    feature: 'Intelligence',
    traditional: 'Basic order books, no analytics',
    predictly: 'AI swarm technology providing real-time market signals and sentiment analysis',
    icon: LayoutDashboard,
  },
]

const PRESS_MENTIONS = [
  { outlet: 'TechCrunch', headline: 'Predictly raises $45M to democratize prediction markets', date: 'Jan 2025' },
  { outlet: 'Forbes', headline: 'How this startup is making prediction markets accessible to everyone', date: 'Dec 2024' },
  { outlet: 'Bloomberg', headline: 'Dual-currency model disrupts traditional betting landscape', date: 'Nov 2024' },
  { outlet: 'Wired', headline: 'AI swarm technology brings new intelligence to prediction markets', date: 'Oct 2024' },
  { outlet: 'The Verge', headline: 'Predictly\'s community-driven approach changes how we forecast events', date: 'Sep 2024' },
]

export default function AboutPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,transparent_60%)]" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(0,210,132,0.08)_0%,transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 text-center">
          <Badge className="mb-6 bg-brand-soft text-brand border-brand/20">About Predictly</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            The Future of{' '}
            <span className="gradient-text">Prediction Markets</span>
          </h1>
          <p className="text-lg md:text-xl text-fg-muted max-w-3xl mx-auto leading-relaxed">
            We&apos;re building the world&apos;s most accessible, transparent, and intelligent
            prediction market platform — where anyone can trade on real-world events
            and the collective wisdom of crowds drives better forecasting.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-brand-soft flex items-center justify-center">
                <Target className="h-5 w-5 text-brand" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Our Mission</h2>
            </div>

            <div className="space-y-6 text-fg-muted leading-relaxed text-base md:text-lg">
              <p>
                At Predictly, we believe that prediction markets are one of the most powerful tools
                ever created for aggregating distributed knowledge. When people have skin in the game,
                their collective forecasts consistently outperform individual experts, polls, and
                traditional models. Our mission is to harness this power and make it accessible to
                everyone — not just Wall Street quant desks and institutional investors.
              </p>
              <p>
                Traditional prediction markets suffer from significant barriers: high minimum deposits,
                limited jurisdictional access, opaque resolution processes, and intimidating interfaces
                that alienate everyday participants. We founded Predictly to tear down these barriers
                and build a platform where a college student in Mumbai can trade alongside a seasoned
                analyst in New York, with equal access to markets, data, and opportunities.
              </p>
              <p>
                Our dual-currency model — Gold Coins for practice and entertainment, Sweeps Coins for
                real prize redemption — represents a fundamental rethinking of how prediction markets
                can operate within regulatory frameworks while still providing genuine value to
                participants. Combined with our Alternative Method of Entry (AMOE), we ensure that
                no purchase is ever necessary to participate, making our platform truly inclusive
                and compliant with sweepstakes regulations across the United States.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-[1400px]" />

      {/* How We're Different */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-yes-soft flex items-center justify-center">
              <Zap className="h-5 w-5 text-yes" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">How We&apos;re Different</h2>
          </div>

          <div className="grid gap-4">
            {DIFFERENCES.map((diff) => (
              <Card key={diff.feature} className="glass border-border hover:border-border-strong transition-colors">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-[200px_1fr_1fr] gap-4 items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
                        <diff.icon className="h-4 w-4 text-brand" />
                      </div>
                      <span className="font-semibold text-sm">{diff.feature}</span>
                    </div>
                    <div className="rounded-lg bg-bg-subtle border border-border p-3">
                      <p className="text-xs text-fg-subtle mb-1 font-medium uppercase tracking-wider">Traditional</p>
                      <p className="text-sm text-fg-muted">{diff.traditional}</p>
                    </div>
                    <div className="rounded-lg bg-brand-soft/50 border border-brand/20 p-3">
                      <p className="text-xs text-brand mb-1 font-medium uppercase tracking-wider">Predictly</p>
                      <p className="text-sm text-fg">{diff.predictly}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-[1400px]" />

      {/* Stats Section */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Predictly by the Numbers</h2>
            <p className="text-fg-muted max-w-2xl mx-auto">
              Since our launch, Predictly has grown rapidly to become one of the most active
              prediction market platforms in the world, serving traders across dozens of countries.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <Card key={stat.label} className="glass border-border text-center group hover:border-brand/30 transition-colors">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-brand-soft flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <stat.icon className="h-6 w-6 text-brand" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                  <div className="text-sm text-fg-muted">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-[1400px]" />

      {/* Team Section */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-sweeps-soft flex items-center justify-center">
                <Users className="h-5 w-5 text-sweeps" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Our Team</h2>
            </div>
            <p className="text-fg-muted max-w-2xl mx-auto">
              Built by a team of world-class engineers, traders, and researchers who share
              a passion for making prediction markets accessible to everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <Card key={member.name} className="glass border-border hover:border-border-strong transition-all hover:shadow-card group">
                <CardContent className="p-6 text-center">
                  <div className={cn(
                    'h-20 w-20 rounded-2xl bg-gradient-to-br mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-105 transition-transform',
                    member.color
                  )}>
                    {member.avatar}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                  <Badge variant="outline" className="mb-3 text-xs">{member.role}</Badge>
                  <p className="text-sm text-fg-muted leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-[1400px]" />

      {/* Press/Media Section */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-warn/10 flex items-center justify-center">
              <Newspaper className="h-5 w-5 text-warn" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">In the Press</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESS_MENTIONS.map((mention) => (
              <Card key={mention.headline} className="glass border-border hover:border-border-strong transition-colors group cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">{mention.outlet}</Badge>
                    <span className="text-xs text-fg-subtle">{mention.date}</span>
                  </div>
                  <h3 className="font-medium text-sm leading-relaxed group-hover:text-brand transition-colors">
                    {mention.headline}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-[1400px]" />

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand to-yes flex items-center justify-center mx-auto mb-6">
              <Award className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Predicting?
            </h2>
            <p className="text-fg-muted text-lg mb-8 leading-relaxed">
              Join over 250,000 traders who are already using Predictly to forecast
              the future. Get 5,000 GC and 50 SC just for signing up — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button className="h-12 px-8 bg-gradient-to-r from-brand to-brand-hover hover:opacity-90 text-white font-semibold shadow-[0_0_16px_-4px_rgba(99,102,241,0.5)]">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="h-12 px-8 border-border hover:border-border-strong">
                  Explore Markets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


