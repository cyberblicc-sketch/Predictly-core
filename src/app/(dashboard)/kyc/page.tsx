'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Shield, CheckCircle, Clock, AlertCircle, Camera,
  ChevronRight, ChevronLeft, Info, Lock, Coins, Gem,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { mockUser } from '@/lib/mockData'

const STEPS = [
  { id: 1, label: 'Personal Info', icon: '📝' },
  { id: 2, label: 'ID Upload', icon: '🪪' },
  { id: 3, label: 'Verification', icon: '🔍' },
  { id: 4, label: 'Complete', icon: '✅' },
] as const

export default function KYCPage() {
  const kycStatus = mockUser.kyc_status
  const [currentStep, setCurrentStep] = useState(() => {
    if (kycStatus === 'approved') return 4
    if (kycStatus === 'pending') return 3
    return 1
  })

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')

  const isApproved = kycStatus === 'approved'
  const isPending = kycStatus === 'pending'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yes/30 to-yes/10 flex items-center justify-center border border-yes-border">
          <Shield className="h-5 w-5 text-yes" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">KYC Verification</h1>
          <p className="text-sm text-fg-muted mt-0.5">Verify your identity to unlock Sweeps Coin redemptions</p>
        </div>
      </div>

      {/* Current status indicator */}
      <div className={cn(
        'rounded-xl border p-4 flex items-center gap-4',
        isApproved
          ? 'bg-yes-soft/20 border-yes-border'
          : isPending
            ? 'bg-gold-soft/20 border-gold-border'
            : 'bg-bg-subtle border-border'
      )}>
        <div className={cn(
          'h-12 w-12 rounded-xl flex items-center justify-center shrink-0',
          isApproved ? 'bg-yes-soft' : isPending ? 'bg-gold-soft' : 'bg-bg-elevated'
        )}>
          {isApproved ? (
            <CheckCircle className="h-6 w-6 text-yes" />
          ) : isPending ? (
            <Clock className="h-6 w-6 text-gold" />
          ) : (
            <Shield className="h-6 w-6 text-fg-muted" />
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold">
            {isApproved ? 'Identity Verified' : isPending ? 'Verification in Progress' : 'Verification Required'}
          </div>
          <p className="text-sm text-fg-muted mt-0.5">
            {isApproved
              ? 'Your identity has been verified. You can now redeem Sweeps Coins for real prizes.'
              : isPending
                ? 'We\'re reviewing your documents. This usually takes 1-2 business days.'
                : 'Complete KYC verification to unlock Sweeps Coin redemptions and withdrawals.'}
          </p>
        </div>
        <div className={cn(
          'shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold',
          isApproved ? 'bg-yes text-bg' : isPending ? 'bg-gold text-bg' : 'bg-bg-elevated text-fg-muted'
        )}>
          {isApproved ? 'Approved' : isPending ? 'Pending' : 'Not Started'}
        </div>
      </div>

      {/* Steps progress */}
      <div className="rounded-xl bg-bg-subtle border border-border p-5">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center text-lg border-2 transition-colors',
                  currentStep > step.id
                    ? 'bg-yes border-yes text-bg'
                    : currentStep === step.id
                      ? 'bg-brand border-brand text-white'
                      : 'bg-bg border-border text-fg-subtle'
                )}>
                  {currentStep > step.id ? '✓' : step.emoji}
                </div>
                <span className={cn(
                  'text-2xs font-medium mt-1.5',
                  currentStep >= step.id ? 'text-fg' : 'text-fg-subtle'
                )}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-3 mt-[-18px] rounded-full',
                  currentStep > step.id ? 'bg-yes' : 'bg-border'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-xl bg-bg-subtle border border-border p-5">
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold mb-1">Personal Information</h2>
              <p className="text-sm text-fg-muted">Please provide your legal name and address as they appear on your ID</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-fg-muted mb-1.5 block">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-brand placeholder:text-fg-subtle"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-fg-muted mb-1.5 block">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-brand placeholder:text-fg-subtle"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-fg-muted mb-1.5 block">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-brand placeholder:text-fg-subtle"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-fg-muted mb-1.5 block">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-brand placeholder:text-fg-subtle"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-fg-muted mb-1.5 block">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-brand placeholder:text-fg-subtle"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-fg-muted mb-1.5 block">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-brand placeholder:text-fg-subtle"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-fg-muted mb-1.5 block">ZIP Code</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="12345"
                    className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-brand placeholder:text-fg-subtle"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-bg border border-border text-xs text-fg-muted">
              <Lock className="h-4 w-4 text-fg-subtle shrink-0" />
              Your personal information is encrypted and stored securely. We never share your data with third parties.
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="h-10 px-6 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-semibold transition-colors flex items-center gap-2"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: ID Upload */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold mb-1">Upload Identification</h2>
              <p className="text-sm text-fg-muted">Upload a government-issued photo ID (passport, driver&apos;s license, or national ID)</p>
            </div>

            {/* Upload area */}
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-brand/50 transition-colors cursor-pointer">
              <div className="h-16 w-16 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-fg-subtle" />
              </div>
              <p className="text-sm font-medium mb-1">Drop your ID here or click to upload</p>
              <p className="text-2xs text-fg-subtle mb-4">Supports JPG, PNG, PDF · Max 10MB</p>
              <button className="h-9 px-4 rounded-lg bg-bg border border-border hover:border-border-strong text-sm font-medium transition-colors">
                Choose File
              </button>
            </div>

            {/* Requirements */}
            <div className="rounded-lg bg-bg border border-border p-4 space-y-2">
              <h3 className="text-xs font-semibold flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-fg-subtle" /> Document requirements
              </h3>
              <ul className="text-2xs text-fg-muted space-y-1 pl-5 list-disc">
                <li>Document must be valid and not expired</li>
                <li>All four corners of the document must be visible</li>
                <li>Text and photo must be clearly readable</li>
                <li>No glare or shadows on the document</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="h-10 px-4 rounded-lg bg-bg border border-border hover:border-border-strong text-sm font-medium transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="h-10 px-6 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-semibold transition-colors flex items-center gap-2"
              >
                Submit for Verification <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Verification in progress */}
        {currentStep === 3 && (
          <div className="space-y-5 text-center py-6">
            <div className="h-20 w-20 rounded-full bg-gold-soft flex items-center justify-center mx-auto">
              <Clock className="h-10 w-10 text-gold" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1">Verification in Progress</h2>
              <p className="text-sm text-fg-muted max-w-md mx-auto">
                Your documents are being reviewed. This usually takes 1-2 business days.
                You&apos;ll receive a notification once verification is complete.
              </p>
            </div>
            <div className="rounded-lg bg-gold-soft/20 border border-gold-border p-4 max-w-sm mx-auto">
              <p className="text-xs text-gold font-medium">Average review time: 4-8 hours</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setCurrentStep(4)}
                className="h-10 px-6 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-semibold transition-colors"
              >
                Simulate Approval (Demo)
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {currentStep === 4 && (
          <div className="space-y-5 text-center py-6">
            <div className="h-20 w-20 rounded-full bg-yes-soft flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-yes" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1">Verification Complete!</h2>
              <p className="text-sm text-fg-muted max-w-md mx-auto">
                Your identity has been verified. You can now redeem Sweeps Coins for real prizes.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 max-w-md mx-auto">
              <div className="rounded-lg bg-gold-soft/20 border border-gold-border p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-2xs text-gold mb-1">
                  <Coins className="h-3.5 w-3.5" /> GC Redemptions
                </div>
                <div className="text-sm font-bold text-gold">No minimum</div>
              </div>
              <div className="rounded-lg bg-sweeps-soft/20 border border-sweeps-border p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-2xs text-sweeps mb-1">
                  <Gem className="h-3.5 w-3.5" /> SC Redemptions
                </div>
                <div className="text-sm font-bold text-sweeps">Min 100 SC</div>
              </div>
            </div>
            <Link
              href="/portfolio"
              className="inline-flex h-10 px-6 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-semibold items-center transition-colors"
            >
              Go to Portfolio
            </Link>
          </div>
        )}
      </div>

      {/* What happens after verification */}
      <div className="rounded-xl bg-bg-subtle border border-border p-5">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-fg-subtle" /> What happens after verification?
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { emoji: '💎', title: 'SC Redemptions', desc: 'Redeem Sweeps Coins for real prizes via ACH, gift cards, or crypto' },
            { emoji: '🎁', title: 'Bonus Rewards', desc: 'Earn KYC verification bonus of 25 SC after completing verification' },
            { emoji: '📈', title: 'Higher Limits', desc: 'Increased deposit and withdrawal limits for verified users' },
            { emoji: '🔒', title: 'Account Security', desc: 'Enhanced account protection and recovery options' },
          ].map((item) => (
            <div key={item.title} className="rounded-lg bg-bg border border-border p-3 flex gap-3">
              <span className="text-xl shrink-0">{item.emoji}</span>
              <div>
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-2xs text-fg-muted">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Min redemption amounts */}
      <div className="rounded-xl bg-bg-subtle border border-border p-5">
        <h2 className="text-sm font-semibold mb-3">Minimum Redemption Amounts</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-bg border border-border p-4 text-center">
            <div className="text-2xl mb-1">💳</div>
            <div className="text-sm font-semibold">ACH Transfer</div>
            <div className="text-2xs text-fg-muted mt-0.5">Minimum 100 SC</div>
            <div className="text-xs text-fg-subtle mt-1">3-5 business days</div>
          </div>
          <div className="rounded-lg bg-bg border border-border p-4 text-center">
            <div className="text-2xl mb-1">🎁</div>
            <div className="text-sm font-semibold">Gift Card</div>
            <div className="text-2xs text-fg-muted mt-0.5">Minimum 50 SC</div>
            <div className="text-xs text-fg-subtle mt-1">Instant delivery</div>
          </div>
          <div className="rounded-lg bg-bg border border-border p-4 text-center">
            <div className="text-2xl mb-1">₿</div>
            <div className="text-sm font-semibold">Crypto</div>
            <div className="text-2xs text-fg-muted mt-0.5">Minimum 200 SC</div>
            <div className="text-xs text-fg-subtle mt-1">1-2 business days</div>
          </div>
        </div>
      </div>
    </div>
  )
}
