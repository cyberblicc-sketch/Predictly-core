'use client'

import { Lock, Eye, Database, Bell, UserCheck, Globe, Shield } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand/10 to-bg py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12)_0%,transparent_70%)]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-brand-soft border border-brand/20 text-brand-hover text-xs font-medium mb-4">
            <Lock className="h-3 w-3" /> Legal
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="mt-4 text-fg-muted max-w-xl mx-auto">
            Last updated: May 24, 2026. How Predictly collects, uses, and protects your data.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
        <Card icon={<Eye />} title="1. Information We Collect">
          <p>We collect information you provide directly when creating an account (name, email address, phone number), completing KYC verification (government-issued ID, proof of address), making transactions, or contacting support. We also automatically collect certain technical information when you use our Service, including your IP address, browser type, device information, operating system, referring URLs, and interaction data with our platform.</p>
          <p>When you participate in markets, we record your trading activity including positions taken, amounts wagered, and outcomes. This data is necessary for the proper functioning of our dual-currency system, market resolution, and compliance with applicable regulations. We also collect location data to determine your eligibility to use our Service based on jurisdictional requirements.</p>
        </Card>

        <Card icon={<Database />} title="2. How We Use Your Information">
          <p>We use your information to provide, maintain, and improve the Service, process transactions and market resolutions, verify your identity and age through our KYC process, communicate with you about your account, markets, and promotions, enforce our Terms of Service and prevent fraud or unauthorized access, comply with legal obligations and regulatory requirements, and analyze usage patterns to enhance user experience and platform features.</p>
          <p>We may use aggregated, non-personally identifiable information for analytical purposes, including understanding how users interact with our platform, identifying trends in market activity, and improving our risk management systems. This aggregated data does not identify individual users and may be shared publicly or with third parties at our discretion.</p>
        </Card>

        <Card icon={<Shield />} title="3. Data Security">
          <p>Predictly implements industry-standard security measures to protect your personal information, including encryption of data in transit using TLS/SSL, encryption of sensitive data at rest, regular security audits and vulnerability assessments, access controls limiting employee access to personal data, and secure data storage with regular backups. We also monitor our systems for unauthorized access and potential security breaches.</p>
          <p>Despite our best efforts, no method of electronic storage or internet transmission is completely secure. While we strive to protect your personal information, we cannot guarantee its absolute security. You are responsible for maintaining the confidentiality of your account credentials and for any activities that occur under your account. We recommend using strong, unique passwords and enabling two-factor authentication when available.</p>
        </Card>

        <Card icon={<UserCheck />} title="4. KYC and Identity Verification">
          <p>To redeem Sweeps Coins for cash prizes, you must complete our Know Your Customer (KYC) verification process. During this process, we collect and verify your full legal name, date of birth, residential address, and government-issued photo identification. This information is processed by our identity verification partners and is stored securely in compliance with applicable data protection laws.</p>
          <p>KYC documents and verification data are retained for the period required by applicable anti-money laundering regulations, typically five years after the closure of your account. You may request deletion of your KYC data after the regulatory retention period has expired, subject to any ongoing legal obligations that require us to maintain such records.</p>
        </Card>

        <Card icon={<Globe />} title="5. Cookies and Tracking">
          <p>Predictly uses cookies and similar tracking technologies to operate and improve our Service. Essential cookies are used for authentication, session management, and security. Analytics cookies help us understand how users interact with our platform. Marketing cookies may be used to deliver relevant promotions. You can manage your cookie preferences through your browser settings at any time.</p>
          <p>We also use pixel tags and similar technologies in our emails to track open rates and click-through rates, helping us optimize our communications. You can opt out of email tracking by disabling image loading in your email client or by unsubscribing from marketing emails through the link provided in each communication.</p>
        </Card>

        <Card icon={<Bell />} title="6. Your Rights">
          <p>Depending on your jurisdiction, you may have the following rights regarding your personal data: the right to access your personal data, the right to rectify inaccurate data, the right to erasure (subject to legal retention requirements), the right to restrict processing, the right to data portability, the right to object to processing, and the right not to be subject to automated decision-making. To exercise these rights, please contact our privacy team.</p>
          <p>We will respond to your request within 30 days and will not discriminate against you for exercising your privacy rights. In some cases, we may need to verify your identity before processing your request. If we are unable to comply with your request, we will explain the reasons for the denial and inform you of any available appeal mechanisms.</p>
        </Card>

        <div className="rounded-xl bg-bg-subtle border border-border p-6 text-center">
          <p className="text-sm text-fg-muted">Questions about our privacy practices? <a href="/contact" className="text-brand hover:text-brand-hover underline underline-offset-2">Contact our privacy team</a></p>
          <p className="text-2xs text-fg-subtle mt-2">Effective Date: May 24, 2026 &middot; Predictly Inc.</p>
        </div>
      </section>
    </div>
  )
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-bg-subtle border border-border p-6 space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-brand-soft border border-brand/20 flex items-center justify-center text-brand shrink-0">
          {icon}
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="text-sm text-fg-muted leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  )
}
