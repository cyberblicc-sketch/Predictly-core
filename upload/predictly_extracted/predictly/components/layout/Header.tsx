'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Search, Bell, Wallet, ChevronDown, Menu, X } from 'lucide-react'
import { cn, formatUSD } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/',           label: 'Markets' },
  { href: '/portfolio',  label: 'Portfolio' },
  { href: '/leaderboard',label: 'Leaderboard' },
  { href: '/profile',    label: 'Profile' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const balance = 12_482.55

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' || pathname.startsWith('/markets') : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-brand to-yes flex items-center justify-center font-bold text-white">
              P
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yes" />
            </div>
            <span className="font-semibold text-lg tracking-tight hidden sm:inline">
              predictly
            </span>
          </Link>

          {/* Search — desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
              <input
                type="text"
                placeholder="Search markets, traders, topics..."
                className="w-full h-10 pl-10 pr-12 rounded-lg bg-bg-subtle border border-border focus:border-brand focus:outline-none text-sm placeholder:text-fg-subtle"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-fg-subtle border border-border rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
            </div>
          </div>

          {/* Nav links — desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-fg bg-bg-elevated'
                    : 'text-fg-muted hover:text-fg hover:bg-bg-subtle'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <button className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-lg bg-bg-subtle border border-border hover:border-border-strong transition-colors">
              <Wallet className="h-4 w-4 text-yes" />
              <span className="text-sm font-semibold tabular-nums">{formatUSD(balance, { compact: false })}</span>
              <ChevronDown className="h-3.5 w-3.5 text-fg-subtle" />
            </button>

            <button className="relative h-10 w-10 rounded-lg bg-bg-subtle border border-border hover:border-border-strong flex items-center justify-center transition-colors">
              <Bell className="h-4 w-4 text-fg-muted" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-no" />
            </button>

            <button className="hidden sm:inline-flex h-10 px-4 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-semibold transition-colors">
              Deposit
            </button>

            <div className="hidden sm:block h-9 w-9 rounded-full bg-gradient-to-br from-brand to-yes flex items-center justify-center text-sm font-semibold border border-border" />

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden h-10 w-10 rounded-lg bg-bg-subtle border border-border flex items-center justify-center"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 space-y-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
              <input
                type="text"
                placeholder="Search markets..."
                className="w-full h-10 pl-10 rounded-lg bg-bg-subtle border border-border text-sm"
              />
            </div>
            <nav className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-3 py-2.5 rounded-md text-sm font-medium text-center',
                    isActive(link.href) ? 'bg-bg-elevated text-fg' : 'bg-bg-subtle text-fg-muted'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <button className="w-full h-11 rounded-lg bg-brand text-white text-sm font-semibold">
              Deposit
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
