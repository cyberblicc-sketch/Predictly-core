'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { formatCurrency } from '@/lib/utils'
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  FileText,
  Camera,
  User,
  Loader2,
  AlertTriangle,
} from 'lucide-react'

type KYCStep = 'intro' | 'identity' | 'document' | 'selfie' | 'review' | 'complete'

const kycRequirements = [
  { icon: User, label: 'Personal Information', description: 'Name, DOB, Address' },
  { icon: FileText, label: 'Government ID', description: 'Passport, Driver\'s License, or ID Card' },
  { icon: Camera, label: 'Selfie Verification', description: 'Photo of yourself for identity confirmation' },
]

export default function KYCPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<KYCStep>('intro')
  const [isLoading, setIsLoading] = React.useState(false)
  const [verificationStatus, setVerificationStatus] = React.useState<'pending' | 'approved' | 'rejected'>('pending')

  const handleStartVerification = () => {
    setStep('identity')
  }

  const handleIdentitySubmit = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    setStep('document')
  }

  const handleDocumentSubmit = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    setStep('selfie')
  }

  const handleSelfieSubmit = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    setStep('review')
  }

  const handleComplete = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    setStep('complete')
    setVerificationStatus('pending')
  }

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Verify Your Identity</h2>
              <p className="text-muted-foreground mt-2">
                Complete identity verification to unlock withdrawal capabilities and higher limits.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-profit" />
                Benefits of KYC Verification
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-profit/10 rounded-full flex items-center justify-center">
                    <span className="text-lg">💎</span>
                  </div>
                  <div>
                    <p className="font-medium">Redeem Sweeps Coins</p>
                    <p className="text-sm text-muted-foreground">Minimum 50 SC for gift cards</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                    <span className="text-lg">🪙</span>
                  </div>
                  <div>
                    <p className="font-medium">Higher Withdrawal Limits</p>
                    <p className="text-sm text-muted-foreground">Up to $10,000 per day</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sweeps/10 rounded-full flex items-center justify-center">
                    <span className="text-lg">🎁</span>
                  </div>
                  <div>
                    <p className="font-medium">Exclusive Promotions</p>
                    <p className="text-sm text-muted-foreground">Access to VIP contests and rewards</p>
                  </div>
                </li>
              </ul>
            </div>

            <Card className="border-amber-500/50 bg-amber-500/10">
              <CardContent className="flex items-start gap-3 pt-4">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-500">Important Notice</p>
                  <p className="text-muted-foreground">
                    Your data is processed securely via Stripe Identity. We never store your 
                    documents directly. Verification typically takes 1-2 minutes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleStartVerification} className="w-full" size="lg">
              Start Verification
            </Button>
          </div>
        )

      case 'identity':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => setStep('intro')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-bold">Personal Information</h2>
                <p className="text-sm text-muted-foreground">Step 1 of 3</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <input
                  type="text"
                  placeholder="123 Main Street"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <input
                    type="text"
                    placeholder="New York"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Postal Code</label>
                  <input
                    type="text"
                    placeholder="10001"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                </select>
              </div>
            </div>

            <Button onClick={handleIdentitySubmit} className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        )

      case 'document':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => setStep('identity')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-bold">Upload Document</h2>
                <p className="text-sm text-muted-foreground">Step 2 of 3</p>
              </div>
            </div>

            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="font-medium mb-2">Upload Government ID</p>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Please upload a clear photo of your passport, driver's license, or national ID card
                </p>
                <Button variant="outline">
                  Choose File
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('identity')}>Back</Button>
              <Button onClick={handleDocumentSubmit} className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </div>
        )

      case 'selfie':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => setStep('document')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-bold">Selfie Verification</h2>
                <p className="text-sm text-muted-foreground">Step 3 of 3</p>
              </div>
            </div>

            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Camera className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="font-medium mb-2">Take a Selfie</p>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Please take a clear photo of yourself looking directly at the camera
                </p>
                <Button variant="outline">
                  Open Camera
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('document')}>Back</Button>
              <Button onClick={handleSelfieSubmit} className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </div>
        )

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Verification Under Review</h2>
              <p className="text-muted-foreground mt-2">
                Your documents are being reviewed. This usually takes 1-2 minutes.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Personal Information</span>
                    <CheckCircle2 className="w-5 h-5 text-profit" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Document Upload</span>
                    <CheckCircle2 className="w-5 h-5 text-profit" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Selfie Verification</span>
                    <CheckCircle2 className="w-5 h-5 text-profit" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </div>
        )

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="text-center">
              {verificationStatus === 'approved' ? (
                <>
                  <div className="w-20 h-20 bg-profit/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-profit" />
                  </div>
                  <h2 className="text-2xl font-bold text-profit">Verification Complete!</h2>
                  <p className="text-muted-foreground mt-2">
                    Your identity has been verified successfully. You now have full access to withdrawal features.
                  </p>
                </>
              ) : verificationStatus === 'rejected' ? (
                <>
                  <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-10 h-10 text-destructive" />
                  </div>
                  <h2 className="text-2xl font-bold text-destructive">Verification Failed</h2>
                  <p className="text-muted-foreground mt-2">
                    We couldn't verify your identity. Please try again with clearer documents.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => setStep('intro')}>
                    Try Again
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Verification Pending</h2>
                  <p className="text-muted-foreground mt-2">
                    Your documents are under review. You'll be notified once the verification is complete.
                  </p>
                </>
              )}
            </div>

            {verificationStatus !== 'rejected' && (
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            )}
          </div>
        )
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Identity Verification</h1>
        <p className="text-muted-foreground">Complete KYC to unlock all features</p>
      </div>

      {/* Progress Steps */}
      {step !== 'intro' && step !== 'complete' && (
        <div className="flex items-center justify-between">
          {kycRequirements.map((req, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                i < 2 ? 'bg-profit text-white' : i === 2 && step === 'selfie' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                <req.icon className="w-5 h-5" />
              </div>
              {i < 2 && (
                <div className={`w-16 h-1 ${
                  i === 0 && step !== 'identity' ? 'bg-profit' : i === 1 && step === 'selfie' ? 'bg-profit' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          {renderStep()}
        </CardContent>
      </Card>

      <Disclaimer />
    </div>
  )
}