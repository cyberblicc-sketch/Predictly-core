'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search, Bell, Wallet, ChevronDown, Menu, User, LogOut, Settings,
  Coins, Gem, Plus, Moon, Sun,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { mockUser } from '@/lib/mockData'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { MobileNav } from '@/components/layout/MobileNav'

const NAV_LINKS = [
  { href: '/',            label: 'Markets' },
  { href: '/portfolio',   label: 'Portfolio' },
  { href: '/leaderboard', label: 'Leaderboard' },
]

const gcBalance = mockUser.gold_balance
const scBalance = mockUser.sweeps_balance

export function Header() {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' || pathname.startsWith('/markets') : pathname.startsWith(href)

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="flex h-16 items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-brand to-yes flex items-center justify-center font-bold text-white text-sm">
                SF
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yes" />
              </div>
              <span className="font-semibold text-lg tracking-tight hidden sm:inline">
                Supreme Fusion
              </span>
            </Link>

            {/* Search — desktop */}
            <div className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
                <input
                  type="text"
                  placeholder="Search markets, traders, topics..."
                  className="w-full h-10 pl-10 pr-12 rounded-lg bg-bg-subtle border border-border focus:border-brand focus:outline-none text-sm placeholder:text-fg-subtle transition-colors"
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
              {/* Dual-currency wallet dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-lg bg-bg-subtle border border-border hover:border-border-strong transition-colors">
                    <Coins className="h-4 w-4 text-gold" />
                    <span className="text-sm font-semibold tabular-nums text-gold">{gcBalance.toLocaleString()} GC</span>
                    <span className="text-border-strong">|</span>
                    <Gem className="h-3.5 w-3.5 text-sweeps" />
                    <span className="text-sm font-semibold tabular-nums text-sweeps">{scBalance.toLocaleString()} SC</span>
                    <ChevronDown className="h-3.5 w-3.5 text-fg-subtle" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-medium">Wallet Balances</p>
                      <div className="flex gap-2">
                        <div className="flex-1 rounded-lg bg-gold-soft border border-gold-border p-2.5">
                          <div className="flex items-center gap-1.5 text-2xs text-gold mb-0.5">
                            <Coins className="h-3 w-3" /> Gold Coins
                          </div>
                          <div className="text-sm font-bold text-gold tabular-nums">{gcBalance.toLocaleString()}</div>
                        </div>
                        <div className="flex-1 rounded-lg bg-sweeps-soft border border-sweeps-border p-2.5">
                          <div className="flex items-center gap-1.5 text-2xs text-sweeps mb-0.5">
                            <Gem className="h-3 w-3" /> Sweeps Coins
                          </div>
                          <div className="text-sm font-bold text-sweeps tabular-nums">{scBalance.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/portfolio" className="cursor-pointer">
                        <Wallet className="h-4 w-4" />
                        View Portfolio
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/history" className="cursor-pointer">
                        <Settings className="h-4 w-4" />
                        Transaction History
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notification bell */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-10 w-10 rounded-lg bg-bg-subtle border border-border hover:border-border-strong flex items-center justify-center transition-colors">
                    <Bell className="h-4 w-4 text-fg-muted" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-no">
                      <span className="absolute inset-0 rounded-full bg-no animate-ping opacity-75" />
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                    <span className="text-sm font-medium">Market Resolved</span>
                    <span className="text-xs text-fg-muted">Will AI pass bar exam? — Resolved YES</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                    <span className="text-sm font-medium">Trade Executed</span>
                    <span className="text-xs text-fg-muted">Bought YES on BTC to $200k</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="text-brand cursor-pointer justify-center">
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme toggle */}
              <button
                onClick={() => {
                  const next = !isDark
                  setIsDark(next)
                  document.documentElement.classList.toggle('light', !next)
                }}
                className="h-10 w-10 rounded-lg bg-bg-subtle border border-border hover:border-border-strong flex items-center justify-center transition-colors"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Moon className="h-4 w-4 text-fg-muted" /> : <Sun className="h-4 w-4 text-gold" />}
              </button>

              {/* Deposit button */}
              <button className="hidden sm:inline-flex h-10 px-4 rounded-lg bg-gradient-to-r from-brand to-brand-hover hover:opacity-90 text-white text-sm font-semibold transition-opacity shadow-[0_0_16px_-4px_rgba(99,102,241,0.5)]">
                <Plus className="h-4 w-4 mr-1.5" />
                Deposit
              </button>

              {/* User avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex h-9 w-9 rounded-full bg-gradient-to-br from-brand to-yes items-center justify-center text-sm font-semibold border border-border hover:border-border-strong transition-colors">
                    {mockUser.username.charAt(0)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{mockUser.username}</p>
                      <p className="text-xs text-fg-muted">{mockUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/portfolio" className="cursor-pointer">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" className="cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile hamburger menu */}
              <button
                className="lg:hidden h-10 w-10 rounded-lg bg-bg-subtle border border-border flex items-center justify-center hover:border-border-strong transition-colors"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  )
}
