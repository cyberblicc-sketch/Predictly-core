'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Mail, MessageSquare, Clock, CheckCircle2, AlertCircle,
  Send, Twitter, MessageCircle, Github, ChevronDown, ChevronUp,
  Phone,
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const FAQ_ITEMS = [
  {
    question: 'How do I verify my account (KYC)?',
    answer: 'Navigate to your profile settings and click "Verify Identity." You\'ll need to provide a government-issued photo ID and proof of address. Verification typically takes 1-3 business days. Once approved, you can redeem Sweeps Coins for cash prizes.',
  },
  {
    question: 'How do Sweeps Coins redemptions work?',
    answer: 'After completing KYC verification, you can request a redemption from your wallet. Minimum redemption is 100 SC ($100). Redemptions are processed via ACH bank transfer within 5-7 business days. There are no redemption fees.',
  },
  {
    question: 'What is the Alternative Method of Entry (AMOE)?',
    answer: 'The AMOE allows you to receive free Sweeps Coins without making a purchase. Simply fill out the AMOE form on our website to receive 50 SC per entry (one entry per day). This ensures no purchase is necessary to participate.',
  },
  {
    question: 'How are markets resolved?',
    answer: 'Each market has clearly defined resolution criteria and sources. When a market closes, our team verifies the outcome using the specified sources. Resolution typically occurs within 24-48 hours of the market end date. If you disagree with a resolution, you can file a dispute through our support.',
  },
  {
    question: 'I forgot my password. How do I reset it?',
    answer: 'Click "Forgot password?" on the sign-in page and enter your email address. We\'ll send you a password reset link that\'s valid for 24 hours. If you don\'t receive the email, check your spam folder or contact support.',
  },
]

const CATEGORIES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'billing', label: 'Billing & Purchases' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feedback', label: 'Feature Feedback' },
  { value: 'kyc', label: 'KYC Verification' },
  { value: 'redemption', label: 'Redemption Help' },
  { value: 'partnership', label: 'Partnership Inquiry' },
]

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !subject || !message) {
      setError('Name, email, subject, and message are required')
      return
    }

    if (message.length < 10) {
      setError('Message must be at least 10 characters long')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, category, message }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send message')
        return
      }

      setSuccess(true)
      toast.success('Message Sent!', {
        description: 'We\'ll get back to you within 24 hours.',
      })

      // Reset form
      setName('')
      setEmail('')
      setSubject('')
      setCategory('')
      setMessage('')
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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12)_0%,transparent_60%)]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(0,210,132,0.06)_0%,transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 text-center">
          <Badge className="mb-6 bg-brand-soft text-brand border-brand/20">Support</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-lg md:text-xl text-fg-muted max-w-3xl mx-auto leading-relaxed">
            Have a question, feedback, or need help? Our team is here for you.
            Reach out and we&apos;ll respond as quickly as possible.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 md:pb-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Left: Contact Form */}
            <div>
              {/* Success Alert */}
              {success && (
                <Alert className="mb-6 bg-yes-soft border-yes-border">
                  <CheckCircle2 className="h-4 w-4 text-yes" />
                  <AlertTitle className="text-yes font-semibold">Message Sent Successfully!</AlertTitle>
                  <AlertDescription className="text-fg-muted">
                    Thank you for reaching out! Our support team has received your message and will
                    respond within 24 hours. Please check your email for a confirmation.
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

              <Card className="glass border-border">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Send Us a Message</CardTitle>
                      <CardDescription className="text-fg-muted">
                        Fill out the form below and we&apos;ll get back to you within 24 hours.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Name</Label>
                        <Input
                          id="contact-name"
                          type="text"
                          value={name}
                          onChange={(e) => { setName(e.target.value); setError('') }}
                          placeholder="Your full name"
                          className="h-11 bg-bg-subtle border-border focus:border-brand"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Email</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError('') }}
                          placeholder="your.email@example.com"
                          className="h-11 bg-bg-subtle border-border focus:border-brand"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Subject */}
                      <div className="space-y-2">
                        <Label htmlFor="contact-subject">Subject</Label>
                        <Input
                          id="contact-subject"
                          type="text"
                          value={subject}
                          onChange={(e) => { setSubject(e.target.value); setError('') }}
                          placeholder="Brief description of your inquiry"
                          className="h-11 bg-bg-subtle border-border focus:border-brand"
                          required
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-2">
                        <Label htmlFor="contact-category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="h-11 bg-bg-subtle border-border focus:border-brand">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="contact-message">Message</Label>
                      <Textarea
                        id="contact-message"
                        value={message}
                        onChange={(e) => { setMessage(e.target.value); setError('') }}
                        placeholder="Tell us how we can help you. Please be as detailed as possible so we can assist you faster."
                        className="min-h-[160px] bg-bg-subtle border-border focus:border-brand resize-y"
                        required
                      />
                      <p className="text-xs text-fg-subtle">{message.length}/2000 characters</p>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        'w-full h-12 font-semibold transition-all',
                        loading
                          ? 'bg-bg-elevated text-fg-subtle'
                          : 'bg-gradient-to-r from-brand to-brand-hover hover:opacity-90 text-white shadow-[0_0_16px_-4px_rgba(99,102,241,0.5)]'
                      )}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Send Message
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right: Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="glass border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-brand-soft flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm text-fg-subtle">Email</p>
                      <a href="mailto:support@predictly.io" className="text-sm font-medium text-fg hover:text-brand transition-colors">
                        support@predictly.io
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-yes-soft flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-yes" />
                    </div>
                    <div>
                      <p className="text-sm text-fg-subtle">Response Time</p>
                      <p className="text-sm font-medium text-fg">Within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gold-soft flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm text-fg-subtle">Support Hours</p>
                      <p className="text-sm font-medium text-fg">Mon–Fri, 9 AM – 6 PM ET</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="glass border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Connect With Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 rounded-lg bg-bg-subtle border border-border hover:border-border-strong hover:bg-bg-elevated transition-colors group"
                  >
                    <Twitter className="h-5 w-5 text-fg-muted group-hover:text-brand transition-colors" />
                    <div>
                      <p className="text-sm font-medium">Twitter / X</p>
                      <p className="text-xs text-fg-subtle">@PredictlyHQ</p>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 rounded-lg bg-bg-subtle border border-border hover:border-border-strong hover:bg-bg-elevated transition-colors group"
                  >
                    <MessageCircle className="h-5 w-5 text-fg-muted group-hover:text-sweeps transition-colors" />
                    <div>
                      <p className="text-sm font-medium">Discord</p>
                      <p className="text-xs text-fg-subtle">Join our community</p>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 rounded-lg bg-bg-subtle border border-border hover:border-border-strong hover:bg-bg-elevated transition-colors group"
                  >
                    <Github className="h-5 w-5 text-fg-muted group-hover:text-fg transition-colors" />
                    <div>
                      <p className="text-sm font-medium">GitHub</p>
                      <p className="text-xs text-fg-subtle">Open source tools</p>
                    </div>
                  </a>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card className="glass border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick FAQ</CardTitle>
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
