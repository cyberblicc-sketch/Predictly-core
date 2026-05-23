'use client'

import {
  Shield, AlertTriangle, Coins, Scale, FileCheck, Lock,
  Ban, Globe, BookOpen, Clock, RefreshCw,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const SECTIONS = [
  {
    icon: AlertTriangle,
    iconColor: 'text-warn',
    iconBg: 'bg-warn/10',
    title: 'General Disclaimer',
    content: [
      'Predictly is a dual-currency prediction market platform designed for entertainment purposes. The information provided on this platform, including market odds, probabilities, and trading signals, should not be construed as financial advice, investment recommendations, or solicitation to engage in any particular trading activity.',
      'Users acknowledge that trading on prediction markets involves significant risk and that the outcomes of markets are inherently uncertain. Predictly does not guarantee the accuracy, completeness, or timeliness of any information displayed on the platform, including market probabilities which are derived from aggregate trading activity and do not represent the views or predictions of Predictly itself.',
      'By using Predictly, you accept full responsibility for your trading decisions and acknowledge that you have read and understood these disclaimers. If you do not agree with any part of these disclaimers, you should not use the platform.',
    ],
  },
  {
    icon: Coins,
    iconColor: 'text-gold',
    iconBg: 'bg-gold-soft',
    title: 'Dual Currency Explanation',
    content: [
      'Predictly operates on a dual-currency system consisting of Gold Coins (GC) and Sweeps Coins (SC). These two currencies serve fundamentally different purposes and have distinct properties that users must understand before participating on the platform.',
      'Gold Coins (GC) are a virtual currency used for entertainment and practice purposes only. GC have no monetary value, cannot be transferred to other users, and cannot be redeemed for real money or prizes. GC are provided free of charge with purchases of GC packages, daily login bonuses, and promotional giveaways. GC are intended to allow users to experience the platform and practice trading strategies without financial risk.',
      'Sweeps Coins (SC) are a promotional sweepstakes currency that can be used to participate in prediction markets and can be redeemed for real cash prizes after completing KYC (Know Your Customer) verification. SC are provided free with GC purchases as a promotional bonus, through the Alternative Method of Entry (AMOE), through daily login bonuses, and through referral rewards. SC can never be purchased directly — they are always provided free of charge.',
    ],
  },
  {
    icon: Shield,
    iconColor: 'text-no',
    iconBg: 'bg-no-soft',
    title: 'Risk Disclosure',
    content: [
      'Trading on prediction markets involves substantial risk of loss. You should carefully consider whether trading on Predictly is appropriate for your financial situation and risk tolerance. The value of your positions may fluctuate significantly and you may lose some or all of your invested Sweeps Coins.',
      'Past performance of any market, trader, or strategy does not guarantee future results. Market probabilities reflect collective sentiment at a given point in time and may change rapidly based on new information, events, or trading activity. A market showing a 90% probability for an outcome does not mean that outcome is certain — it means the market currently prices a 90% chance, and unexpected outcomes do and will occur.',
      'You should never trade with SC that you cannot afford to lose. Predictly encourages responsible trading and provides tools for self-exclusion, deposit limits, and session time limits. If you believe you may have a gambling problem, please contact the National Problem Gambling Helpline at 1-800-522-4700.',
    ],
  },
  {
    icon: Scale,
    iconColor: 'text-brand',
    iconBg: 'bg-brand-soft',
    title: 'Eligibility Requirements',
    content: [
      'To use Predictly, you must be at least 18 years of age (or the legal age of majority in your jurisdiction, whichever is higher). By creating an account, you represent and warrant that you meet this age requirement. Predictly reserves the right to request age verification at any time and to suspend or terminate accounts that cannot verify their age.',
      'Predictly is available only in jurisdictions where participation in sweepstakes-promotion prediction markets is legally permitted. Users are responsible for understanding and complying with the laws applicable to their jurisdiction. Predictly makes no representation that the platform is appropriate or available for use in all locations. Access from jurisdictions where such platforms are prohibited is not authorized.',
      'Employees of Predictly, its affiliates, subsidiaries, and their immediate family members are not eligible to participate in SC markets. Users who have been previously banned from the platform for fraud, manipulation, or Terms of Service violations are not eligible to create new accounts.',
    ],
  },
  {
    icon: FileCheck,
    iconColor: 'text-yes',
    iconBg: 'bg-yes-soft',
    title: 'Market Resolution',
    content: [
      'Markets on Predictly are resolved based on clearly defined criteria specified at the time of market creation. Resolution sources are identified for each market and may include official government data, reputable news organizations, sports league results, or other verifiable sources as specified in the market rules.',
      'In cases where a resolution source provides ambiguous or contradictory information, Predictly reserves the right to use its best judgment to determine the appropriate resolution. All resolution decisions are final and binding. If a market is determined to be invalid due to ambiguity in the question, unforeseen circumstances, or external manipulation, Predictly may void the market and return all staked coins to participants.',
      'Markets may be suspended or cancelled if Predictly determines, in its sole discretion, that there is evidence of manipulation, fraud, or other activity that could compromise the integrity of the market. Suspended markets may be resumed, resolved, or cancelled at Predictly\'s discretion.',
    ],
  },
  {
    icon: Ban,
    iconColor: 'text-no',
    iconBg: 'bg-no-soft',
    title: 'No Guarantee of Profits',
    content: [
      'Predictly makes no guarantee, representation, or warranty that any user will profit from trading on the platform. All trading involves risk, and the vast majority of active traders on any prediction market will experience both gains and losses over time. The platform\'s fee structure and market mechanics mean that aggregate user losses will typically exceed aggregate user gains.',
      'Users should not rely on trading on Predictly as a source of income. The platform is designed for entertainment purposes, and any profits earned should be considered incidental rather than expected. Promotional materials, leaderboards, and success stories highlight exceptional outcomes and are not representative of typical user experiences.',
      'Predictly is not a bank, investment advisor, or financial institution. SC held in your account do not earn interest and are not insured by any government deposit insurance scheme. Predictly reserves the right to modify the platform, fee structure, and terms of service at any time, which may affect the value or utility of your positions.',
    ],
  },
  {
    icon: Lock,
    iconColor: 'text-sweeps',
    iconBg: 'bg-sweeps-soft',
    title: 'Intellectual Property',
    content: [
      'All content, features, and functionality of the Predictly platform, including but not limited to text, graphics, logos, icons, images, audio clips, data compilations, software, and the design, selection, and arrangement thereof, are the exclusive property of Predictly or its licensors and are protected by international copyright, trademark, patent, and other intellectual property laws.',
      'Users may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any materials from the Predictly platform without prior written consent, except as expressly permitted on the platform. Market data and trading information displayed on the platform are provided for personal, non-commercial use only.',
      'The Predictly name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Predictly. You may not use these marks without prior written permission. All other names, logos, product and service names, designs, and slogans on the platform are the trademarks of their respective owners.',
    ],
  },
  {
    icon: Globe,
    iconColor: 'text-fg-muted',
    iconBg: 'bg-bg-elevated',
    title: 'Limitation of Liability',
    content: [
      'To the fullest extent permitted by applicable law, Predictly shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the platform; (b) any conduct or content of any third party on the platform; (c) any content obtained from the platform; or (d) unauthorized access, use, or alteration of your transmissions or content.',
      'In no event shall Predictly\'s total aggregate liability to you for all claims arising out of or relating to the use of the platform exceed the greater of (a) the amount of SC you have wagered in the thirty (30) days preceding the claim, or (b) one hundred US dollars ($100). This limitation applies regardless of the legal theory on which the claim is based.',
      'Predictly does not warrant that the platform will be uninterrupted, timely, secure, or error-free. The platform is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.',
    ],
  },
]

export default function DisclaimerPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12)_0%,transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 text-center">
          <Badge className="mb-6 bg-no-soft text-no border-no/20">Legal</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Legal <span className="gradient-text">Disclaimers</span>
          </h1>
          <p className="text-lg md:text-xl text-fg-muted max-w-3xl mx-auto leading-relaxed">
            Please read these disclaimers carefully before using Predictly. By accessing
            or using the platform, you agree to be bound by these terms.
          </p>
        </div>
      </section>

      {/* Disclaimer Sections */}
      <section className="pb-16 md:pb-20">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6">
          <div className="space-y-6">
            {SECTIONS.map((section, index) => (
              <Card key={section.title} className="glass border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${section.iconBg} flex items-center justify-center shrink-0`}>
                      <section.icon className={`h-5 w-5 ${section.iconColor}`} />
                    </div>
                    <CardTitle className="text-lg md:text-xl">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-sm md:text-base text-fg-muted leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="pb-16">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6">
          <Separator className="mb-8" />
          <div className="flex items-center justify-between text-xs text-fg-subtle">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>Last updated: March 1, 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Version 2.1</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
