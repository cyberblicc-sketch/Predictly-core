'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Gift, AlertCircle, CheckCircle2, Mail, User, MapPin,
  Calendar, ChevronDown, ChevronUp, Info, Star,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

const FAQ_ITEMS = [
  {
    question: 'What is the Alternative Method of Entry (AMOE)?',
    answer: 'The AMOE is a free method that allows you to receive Sweeps Coins (SC) without making a purchase. It is required by law to ensure that no purchase is necessary to participate in sweepstakes. By submitting your information through the AMOE form, you will receive 50 SC credited directly to your account.',
  },
  {
    question: 'How often can I use the AMOE?',
    answer: 'You may submit one AMOE entry per day. Each approved entry will credit your account with 50 SC. Attempting to submit multiple entries in a single day will result in an error. The daily limit resets at midnight UTC.',
  },
  {
    question: 'Is my personal information safe?',
    answer: 'Yes. Your personal information is encrypted and stored securely. We use industry-standard security measures to protect your data. Your information is only used to verify your eligibility for the AMOE program and to credit your account with SC. We never sell your personal information to third parties.',
  },
  {
    question: 'Do I need to create an account first?',
    answer: 'No. If you don\'t already have a Predictly account, one will be automatically created for you when you submit the AMOE form. You\'ll receive 5,000 GC and 50 SC as a welcome bonus, plus the additional 50 SC from the AMOE entry itself.',
  },
  {
    question: 'What can I do with Sweeps Coins?',
    answer: 'Sweeps Coins (SC) can be used to participate in prediction markets on the Predictly platform. When you win trades with SC, your winnings can be redeemed for real cash prizes after completing KYC (Know Your Customer) verification. SC have real monetary value and can be converted to USD at a 1:1 ratio.',
  },
  {
    question: 'Why do you need my mailing address?',
    answer: 'Your mailing address is required for verification purposes and to comply with sweepstakes regulations. We need to confirm that you are a resident of a jurisdiction where our platform is legally available. We may also use it to send physical mail if required by law in your state.',
  },
]

export default function AmoePage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!fullName || !email || !address || !dateOfBirth) {
      setError('All fields are required')
      return
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    // Validate age
    const dob = new Date(dateOfBirth)
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    if (age < 18) {
      setError('You must be at least 18 years old to participate')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/amoe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, address, dateOfBirth }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to process entry')
        return
      }

      setSuccess(true)
      toast.success('AMOE Entry Submitted!', {
        description: '50 SC has been credited to your account.',
      })

      // Reset form
      setFullName('')
      setEmail('')
      setAddress('')
      setDateOfBirth('')
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15)_0%,transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 text-center">
          <Badge className="mb-6 bg-sweeps-soft text-sweeps border-sweeps/20">Free Entry</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Alternative Method of Entry{' '}
            <span className="gradient-text">(AMOE)</span>
          </h1>
          <p className="text-lg md:text-xl text-fg-muted max-w-3xl mx-auto leading-relaxed">
            No purchase is necessary to participate in Predictly&apos;s sweepstakes markets.
            Submit the form below to receive free Sweeps Coins and start trading today.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 md:pb-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Left: Form */}
            <div>
              {/* Explanation Card */}
              <Card className="glass border-border mb-8">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-sweeps-soft flex items-center justify-center shrink-0 mt-0.5">
                      <Info className="h-5 w-5 text-sweeps" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">No Purchase Necessary</h3>
                      <p className="text-sm text-fg-muted leading-relaxed">
                        In compliance with sweepstakes laws, Predictly offers this Alternative Method
                        of Entry (AMOE) to ensure that every participant can receive Sweeps Coins (SC)
                        without making a purchase. Each approved AMOE entry credits your account with
                        50 SC, which can be used to trade in prediction markets and redeemed for real
                        cash prizes. You may submit one entry per day.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Success Alert */}
              {success && (
                <Alert className="mb-6 bg-yes-soft border-yes-border">
                  <CheckCircle2 className="h-4 w-4 text-yes" />
                  <AlertTitle className="text-yes font-semibold">Entry Submitted Successfully!</AlertTitle>
                  <AlertDescription className="text-fg-muted">
                    Your AMOE entry has been processed and 50 SC has been credited to your account.
                    You can now use these Sweeps Coins to trade on any prediction market. Check your
                    email for a confirmation of this entry.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mb-6 bg-no-soft border-no-border">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* AMOE Form */}
              <Card className="glass border-border">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sweeps to-brand flex items-center justify-center">
                      <Gift className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Request Free Sweeps Coins</CardTitle>
                      <CardDescription className="text-fg-muted">
                        Fill out the form below to receive 50 SC — no purchase required.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="amoe-name">Full Name</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
                        <Input
                          id="amoe-name"
                          type="text"
                          value={fullName}
                          onChange={(e) => { setFullName(e.target.value); setError('') }}
                          placeholder="Enter your full legal name"
                          className="pl-10 h-11 bg-bg-subtle border-border focus:border-sweeps"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="amoe-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
                        <Input
                          id="amoe-email"
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError('') }}
                          placeholder="your.email@example.com"
                          className="pl-10 h-11 bg-bg-subtle border-border focus:border-sweeps"
                          required
                        />
                      </div>
                    </div>

                    {/* Mailing Address */}
                    <div className="space-y-2">
                      <Label htmlFor="amoe-address">Mailing Address</Label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-fg-subtle" />
                        <Input
                          id="amoe-address"
                          type="text"
                          value={address}
                          onChange={(e) => { setAddress(e.target.value); setError('') }}
                          placeholder="Full mailing address including city, state, and ZIP code"
                          className="pl-10 h-11 bg-bg-subtle border-border focus:border-sweeps"
                          required
                        />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <Label htmlFor="amoe-dob">Date of Birth</Label>
                      <div className="relative">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
                        <Input
                          id="amoe-dob"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => { setDateOfBirth(e.target.value); setError('') }}
                          className="pl-10 h-11 bg-bg-subtle border-border focus:border-sweeps"
                          required
                        />
                      </div>
                      <p className="text-xs text-fg-subtle">You must be at least 18 years old to participate.</p>
                    </div>

                    <Separator />

                    <Button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        'w-full h-12 font-semibold transition-all',
                        loading
                          ? 'bg-bg-elevated text-fg-subtle'
                          : 'bg-gradient-to-r from-sweeps to-brand hover:opacity-90 text-white shadow-[0_0_16px_-4px_rgba(139,92,246,0.5)]'
                      )}
                    >
                      {loading ? 'Processing...' : 'Submit Entry — Get 50 SC Free'}
                    </Button>

                    <p className="text-xs text-fg-subtle text-center leading-relaxed">
                      By submitting this form, you agree to the{' '}
                      <Link href="/terms" className="text-brand hover:text-brand-hover underline-offset-2 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-brand hover:text-brand-hover underline-offset-2 hover:underline">
                        Privacy Policy
                      </Link>
                      . One entry per day. Must be 18+.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right: Info Sidebar */}
            <div className="space-y-6">
              {/* What You Get */}
              <Card className="glass border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-4 w-4 text-warn" />
                    What You Get
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-sweeps-soft border border-sweeps/20">
                    <span className="text-2xl font-bold text-sweeps">50 SC</span>
                    <span className="text-sm text-fg-muted">Free Sweeps Coins per entry</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gold-soft border border-gold/20">
                    <span className="text-2xl font-bold text-gold">5,000 GC</span>
                    <span className="text-sm text-fg-muted">Gold Coins for new accounts</span>
                  </div>
                  <p className="text-xs text-fg-subtle leading-relaxed">
                    SC can be used to trade in prediction markets and redeemed for real cash prizes.
                    GC are for entertainment and practice purposes only.
                  </p>
                </CardContent>
              </Card>

              {/* Rules */}
              <Card className="glass border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">AMOE Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-fg-muted">
                  <div className="flex items-start gap-2">
                    <span className="text-yes mt-0.5">•</span>
                    <span>One AMOE entry per person per day</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yes mt-0.5">•</span>
                    <span>Must be 18 years or older</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yes mt-0.5">•</span>
                    <span>All fields must be accurate and truthful</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yes mt-0.5">•</span>
                    <span>SC will be credited within 24 hours</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yes mt-0.5">•</span>
                    <span>Valid only in jurisdictions where Predictly operates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yes mt-0.5">•</span>
                    <span>Predictly reserves the right to verify all entries</span>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card className="glass border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {FAQ_ITEMS.map((faq, index) => (
                    <div key={index} className="border-b border-border last:border-0">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between py-3 text-sm text-left hover:text-fg transition-colors"
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      >
                        <span className="font-medium pr-4">{faq.question}</span>
                        {expandedFaq === index ? (
                          <ChevronUp className="h-4 w-4 text-fg-subtle shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-fg-subtle shrink-0" />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <p className="text-sm text-fg-muted leading-relaxed pb-3">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
