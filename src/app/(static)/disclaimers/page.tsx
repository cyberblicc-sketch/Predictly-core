'use client'

import Link from 'next/link'
import { AlertTriangle, Scale, DollarSign, Clock, Shield, FileText } from 'lucide-react'

export default function DisclaimersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand/10 to-bg py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12)_0%,transparent_70%)]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-brand-soft border border-brand/20 text-brand-hover text-xs font-medium mb-4">
            <AlertTriangle className="h-3 w-3" /> Legal
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">
            <span className="gradient-text">Disclaimers</span>
          </h1>
          <p className="mt-4 text-fg-muted max-w-xl mx-auto">
            Last updated: May 24, 2026. Important information about your use of Predictly.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
        <Card icon={<AlertTriangle />} title="General Disclaimer" highlight>
          <p>Predictly is a dual-currency prediction market platform designed for entertainment purposes. The information provided on this platform, including market probabilities, price movements, and outcome predictions, is for informational and entertainment purposes only and should not be construed as financial, investment, legal, or tax advice. Predictly does not recommend, endorse, or suggest any particular trading strategy or market position.</p>
          <p>Users should not rely on any information on the platform as a substitute for professional financial advice. All trading decisions are made at the user's own risk. Predictly makes no warranties, express or implied, regarding the accuracy, completeness, or reliability of any information displayed on the platform. Market prices reflect user sentiment and do not represent the views or predictions of Predictly.</p>
        </Card>

        <Card icon={<DollarSign />} title="Dual Currency Disclaimer">
          <p>Gold Coins (GC) are a virtual currency with no monetary value. GC cannot be redeemed for real money, prizes, or any other item of value. GC are intended for entertainment and practice purposes only. When you purchase GC, you are purchasing a virtual entertainment product, not an investment or financial instrument.</p>
          <p>Sweeps Coins (SC) are a promotional currency provided free of charge with GC purchases, through the Alternative Method of Entry (AMOE), and through various promotional activities. SC can be used to participate in prediction markets and, upon meeting all redemption requirements including KYC verification, can be redeemed for cash prizes at a rate of $1 USD per 1 SC. SC are not a cryptocurrency, security, or investment vehicle. No purchase is necessary to obtain or use SC.</p>
        </Card>

        <Card icon={<Scale />} title="Risk Disclosure">
          <p>Participating in prediction markets involves significant risk, including the risk of losing your entire stake. Market prices can fluctuate rapidly and unpredictably based on news events, public sentiment, and trading activity. You should only participate with funds you can afford to lose and should carefully consider your financial situation before engaging in any trading activity.</p>
          <p>Past performance of any market, trader, or strategy does not guarantee future results. The probability percentages displayed on markets represent current market sentiment and are not predictions or guarantees of outcomes. Markets may be cancelled, paused, or resolved differently than expected due to unforeseen circumstances, errors, or regulatory requirements. Predictly is not responsible for any financial losses incurred through the use of the platform.</p>
        </Card>

        <Card icon={<Clock />} title="Market Resolution Disclaimer">
          <p>Predictly relies on third-party sources to determine market outcomes. While we strive to resolve markets accurately and promptly, we cannot guarantee the timeliness, accuracy, or completeness of resolution sources. In cases where resolution sources provide conflicting information, Predictly reserves the right to determine the outcome based on the most reliable available evidence.</p>
          <p>Markets may be cancelled if the underlying event is significantly delayed, does not occur, or if resolution criteria become impossible to verify. In the event of market cancellation, all positions will be refunded to users' accounts. Predictly reserves the right to pause, cancel, or modify markets at any time if errors, suspicious activity, market manipulation, or other issues are detected.</p>
        </Card>

        <Card icon={<Shield />} title="Eligibility and Jurisdiction">
          <p>You must be at least 18 years of age to use Predictly. The Service may not be available or legal in all jurisdictions. It is your sole responsibility to determine whether your use of the Service is lawful in your jurisdiction. Predictly does not make any representation that the Service is appropriate or available for use in any particular jurisdiction.</p>
          <p>Users from jurisdictions where prediction markets, online gaming, or sweepstakes are prohibited are not eligible to use the Service. If you are located in a restricted jurisdiction, you must not access or use the Service. Predictly complies with applicable laws and regulations and may restrict access from certain jurisdictions at any time. Void where prohibited.</p>
        </Card>

        <Card icon={<FileText />} title="Alternative Method of Entry (AMOE)">
          <p>No purchase is necessary to participate in Predictly's sweepstakes promotion. You can obtain free Sweeps Coins through our Alternative Method of Entry (AMOE) by submitting a request through our <Link href="/amoe" className="text-brand hover:text-brand-hover underline underline-offset-2">AMOE page</Link>. AMOE entries receive the same amount of SC as would be provided with a standard GC purchase. There is no limit to the number of AMOE requests per user per day.</p>
          <p>AMOE requests must include your full name, email address, mailing address, and date of birth. Each valid AMOE request will be processed within 24 hours and the credited SC will appear in your account. AMOE participants have the same opportunities and odds of winning as paying participants. Predictly does not discriminate between AMOE participants and paying users in market outcomes or prize distributions.</p>
        </Card>

        <div className="rounded-xl bg-bg-subtle border border-border p-6 text-center">
          <p className="text-sm text-fg-muted">Questions? <Link href="/contact" className="text-brand hover:text-brand-hover underline underline-offset-2">Contact our team</Link> or visit our <Link href="/amoe" className="text-brand hover:text-brand-hover underline underline-offset-2">AMOE page</Link></p>
          <p className="text-2xs text-fg-subtle mt-2">Effective Date: May 24, 2026 &middot; Predictly Inc.</p>
        </div>
      </section>
    </div>
  )
}

function Card({ icon, title, children, highlight }: { icon: React.ReactNode; title: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-6 space-y-3 ${highlight ? 'bg-brand-soft/30 border-brand/30' : 'bg-bg-subtle border-border'}`}>
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
