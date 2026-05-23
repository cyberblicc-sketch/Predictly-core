'use client'

import { FileText, Shield, Scale, AlertTriangle, Clock, Globe, CheckCircle } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand/10 to-bg py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12)_0%,transparent_70%)]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-brand-soft border border-brand/20 text-brand-hover text-xs font-medium mb-4">
            <FileText className="h-3 w-3" /> Legal
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p className="mt-4 text-fg-muted max-w-xl mx-auto">
            Last updated: May 24, 2026. Please read these terms carefully before using Predictly.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
        <Card icon={<Scale />} title="1. Acceptance of Terms">
          <p>By accessing or using the Predictly platform (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service. These Terms apply to all visitors, users, and others who access or use the Service. Predictly reserves the right to update or modify these Terms at any time without prior notice. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.</p>
          <p>You must be at least 18 years of age and legally capable of entering into binding contracts to use this Service. By using Predictly, you represent and warrant that you meet these eligibility requirements. If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.</p>
        </Card>

        <Card icon={<Shield />} title="2. Dual-Currency System">
          <p>Predictly operates a dual-currency prediction market platform featuring Gold Coins ("GC") and Sweeps Coins ("SC"). Gold Coins are a virtual currency used for entertainment and practice play. GC have no monetary value, cannot be transferred between users, and cannot be redeemed for real money or prizes. GC can be obtained through purchases, daily login bonuses, referrals, and promotional offers.</p>
          <p>Sweeps Coins are a promotional currency that can be used to participate in prediction markets with the opportunity to win additional SC. Unlike GC, Sweeps Coins can be redeemed for real cash prizes after completing the KYC (Know Your Customer) verification process. SC are provided for free with GC purchases, through the Alternative Method of Entry (AMOE), daily login bonuses, referrals, and promotional offers. The redemption rate for SC is $1 USD per 1 SC.</p>
        </Card>

        <Card icon={<AlertTriangle />} title="3. Risk Disclosure">
          <p>Trading on prediction markets involves substantial risk and may result in the loss of your invested capital. Past performance of any market or outcome does not guarantee future results. The probability prices displayed on the platform reflect market sentiment and should not be interpreted as investment advice, financial advice, or guarantees of any particular outcome. You should carefully consider whether trading on prediction markets is appropriate for your financial situation.</p>
          <p>Predictly does not guarantee the accuracy, completeness, or timeliness of any information displayed on the platform. Market prices and probabilities are determined by user activity and may not reflect the true likelihood of any event occurring. You acknowledge that you are solely responsible for your trading decisions and that Predictly shall not be liable for any losses incurred through the use of the Service.</p>
        </Card>

        <Card icon={<CheckCircle />} title="4. Account Registration">
          <p>To access certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify Predictly immediately of any unauthorized use of your account.</p>
          <p>Predictly reserves the right to suspend or terminate your account if any information provided proves to be inaccurate, not current, or incomplete, or if we have reasonable grounds to suspect fraud, abuse, or violation of these Terms. Each user is limited to one account. Creating multiple accounts may result in the suspension of all associated accounts and forfeiture of any balances.</p>
        </Card>

        <Card icon={<Clock />} title="5. Market Resolution">
          <p>All prediction markets on Predictly are resolved based on the outcome of real-world events as determined by our designated resolution sources. Resolution sources are specified on each market page and may include official news outlets, government announcements, sports league results, or other verifiable sources. In the event of a disputed resolution, Predictly's determination shall be final and binding.</p>
          <p>Markets may be cancelled if the underlying event does not occur, is significantly delayed, or if the resolution criteria become impossible to verify. In such cases, all positions will be refunded to users' accounts. Predictly reserves the right to pause or cancel markets at any time if suspicious activity, market manipulation, or errors are detected.</p>
        </Card>

        <Card icon={<Globe />} title="6. Geographic Restrictions">
          <p>The Service may not be available in all jurisdictions. You are solely responsible for determining whether your use of the Service is lawful in your jurisdiction. Predictly makes no representation that the Service is appropriate or available for use in all locations. Accessing the Service from jurisdictions where such activities are prohibited is done at your own risk and responsibility.</p>
          <p>Users from certain jurisdictions may be restricted from accessing specific features, markets, or the Service entirely. Predictly complies with applicable laws and regulations and reserves the right to restrict access from any jurisdiction at any time. If you relocate to a restricted jurisdiction, you must immediately cease using the Service and notify us.</p>
        </Card>

        <Card icon={<FileText />} title="7. Fees and Pricing">
          <p>Predictly charges a fee on market resolutions. The current fee structure is 2% protocol fee plus 1% publisher fee, for a total of 3% on winning positions. These fees are deducted from payouts at the time of market resolution. GC purchases are final and non-refundable. Predictly reserves the right to modify the fee structure at any time with prior notice to users.</p>
          <p>Prices displayed on the platform for GC packages include all applicable charges. SC are provided as a free bonus with GC purchases and cannot be purchased directly. The value of SC credited via the AMOE is determined at Predictly's sole discretion and may vary over time.</p>
        </Card>

        <Card icon={<Shield />} title="8. Privacy and Data">
          <p>Your privacy is important to us. Our collection and use of personal information in connection with the Service is as described in our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.</p>
          <p>Predictly implements appropriate technical and organizational measures to protect your personal data. However, no method of transmission over the Internet or electronic storage is 100% secure. We encourage you to use strong passwords and to protect your account credentials. Predictly shall not be liable for any unauthorized access to your account resulting from your failure to maintain the confidentiality of your credentials.</p>
        </Card>

        <div className="rounded-xl bg-bg-subtle border border-border p-6 text-center">
          <p className="text-sm text-fg-muted">Questions about these Terms? <a href="/contact" className="text-brand hover:text-brand-hover underline underline-offset-2">Contact our team</a></p>
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
