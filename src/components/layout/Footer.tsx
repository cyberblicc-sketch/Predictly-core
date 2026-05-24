import Link from 'next/link'
import { Twitter, MessageCircle, Github } from 'lucide-react'

const FOOTER_COLUMNS = [
  {
    title: 'Markets',
    links: [
      { label: 'All Markets', href: '/markets' },
      { label: 'Politics', href: '/markets?category=Politics' },
      { label: 'Crypto', href: '/markets?category=Crypto' },
      { label: 'Sports', href: '/markets?category=Sports' },
      { label: 'Tech', href: '/markets?category=Tech' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Promotions', href: '/promotions' },
      { label: 'Leaderboard', href: '/leaderboard' },
      { label: 'Referrals', href: '/referrals' },
      { label: 'Sponsored', href: '/sponsored' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'API Docs', href: '/docs' },
      { label: 'MaaS Widgets', href: '/docs' },
      { label: 'Wisdom Feed', href: '/docs' },
      { label: 'Withdrawal', href: '/withdrawal' },
      { label: 'Insurance', href: '/insurance' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Disclaimers', href: '/disclaimer' },
      { label: 'AMOE', href: '/amoe' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Disclaimers', href: '/disclaimers' },
      { label: 'Responsible Play', href: '/disclaimer' },
    ],
  },
]

const SOCIAL_LINKS = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: MessageCircle, href: '#', label: 'Discord' },
  { icon: Github, href: '#', label: 'GitHub' },
]

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10">
        {/* 5-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand to-yes flex items-center justify-center text-white text-sm font-bold">
                PR
              </div>
              <span className="gradient-text font-semibold tracking-tight">Predictly</span>
            </div>
            <p className="text-sm text-fg-muted max-w-xs leading-relaxed mb-4">
              The world&apos;s information network. Trade on real-world events
              from politics to crypto, sports, and beyond. Dual-currency prediction markets
              powered by verifiable sources.
            </p>

            {/* Social icons */}
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="h-9 w-9 rounded-lg bg-bg-subtle border border-border hover:border-border-strong hover:bg-bg-elevated flex items-center justify-center text-fg-muted hover:text-fg transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg-muted hover:text-fg transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 rounded-lg bg-bg-subtle border border-border p-4">
          <p className="text-xs text-fg-subtle leading-relaxed">
            Predictly is a dual-currency prediction market platform for entertainment purposes.
            Gold Coins (GC) have no monetary value and cannot be redeemed for prizes.
            Sweeps Coins (SC) can be redeemed for real prizes after completing KYC verification.
            Must be 18+ to participate. Void where prohibited. Alternative Method of Entry (AMOE) available.
            Past performance does not guarantee future results.
          </p>
        </div>

        {/* Bottom row */}
        <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row gap-3 justify-between items-center">
          <p className="text-xs text-fg-subtle">
            &copy; {new Date().getFullYear()} Predictly. All rights reserved. Dual-currency prediction markets.
          </p>
          <div className="flex gap-4 text-xs text-fg-subtle">
            <Link href="/terms" className="hover:text-fg transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-fg transition-colors">Privacy Policy</Link>
            <Link href="/disclaimer" className="hover:text-fg transition-colors">Disclaimers</Link>
            <Link href="/amoe" className="hover:text-fg transition-colors">AMOE</Link>
            <Link href="/contact" className="hover:text-fg transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
