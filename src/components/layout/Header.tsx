'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Search, Bell, Wallet, ChevronDown, Menu, User, LogOut, Settings,
  Coins, Gem, Plus, Moon, Sun, BookOpen, ShieldCheck,
  ArrowDownToLine, FileText, Zap, Trophy, Gift, Briefcase,
  BookmarkPlus, Tag, History, Shield, TrendingUp,
} from 'lucide-react'
import { mockUser, markets, categories } from '@/lib/mockData'
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
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { MobileNav } from '@/components/layout/MobileNav'
import { DepositModal } from '@/components/trade/DepositModal'

const NAV_LINKS = [
  { href: '/markets',     label: 'Markets' },
  { href: '/playbooks',   label: 'Playbooks' },
  { href: '/sponsored',   label: 'Sponsored' },
  { href: '/portfolio',   label: 'Portfolio' },
  { href: '/insurance',   label: 'Insurance' },
  { href: '/withdrawal',  label: 'Withdrawal' },
  { href: '/watchlist',   label: 'Watchlist' },
  { href: '/history',     label: 'History' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/promotions',  label: 'Promotions' },
  { href: '/referrals',   label: 'Referrals' },
  { href: '/profile',     label: 'Profile' },
  { href: '/docs',        label: 'Docs' },
  { href: '/kyc',         label: 'KYC' },
]

const gcBalance = mockUser.gold_balance
const scBalance = mockUser.sweeps_balance

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [commandOpen, setCommandOpen] = useState(false)
  const [depositOpen, setDepositOpen] = useState(false)

  // ⌘K shortcut to open command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = useCallback((command: () => void) => {
    setCommandOpen(false)
    command()
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-3">

            {/* ── Left: Brand name hero ── */}
            <Link href="/" className="shrink-0 group">
              <span className="gradient-text text-2xl sm:text-3xl font-extrabold tracking-tight transition-opacity group-hover:opacity-80">
                PREDICTLY
              </span>
            </Link>

            {/* ── Right cluster ── */}
            <div className="flex items-center gap-2">

              {/* Search icon button (⌘K) */}
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="relative h-10 w-10 rounded-lg bg-bg-subtle border border-border hover:border-border-strong flex items-center justify-center transition-all hover:bg-bg-elevated"
                aria-label="Search markets (⌘K)"
              >
                <Search className="h-[18px] w-[18px] text-fg-muted" />
                <kbd className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] text-fg-subtle border border-border rounded px-1 py-px font-mono leading-none bg-bg-subtle">
                  ⌘K
                </kbd>
              </button>

              {/* ── Logged-out: Login & Sign Up ── */}
              {false && ( /* placeholder — remove `false &&` to show logged-out state */
                <>
                  <Link
                    href="/signin"
                    className="h-10 px-4 rounded-lg border border-border hover:border-border-strong text-sm font-medium text-fg-muted hover:text-fg transition-all flex items-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="h-10 px-4 rounded-lg bg-gradient-to-r from-brand to-brand-hover hover:opacity-90 text-white text-sm font-semibold transition-opacity shadow-[0_0_16px_-4px_rgba(99,102,241,0.5)] flex items-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {/* ── Logged-in: compact cluster ── */}
              {/* Dual-currency wallet dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex items-center gap-1.5 h-10 px-3 rounded-lg bg-bg-subtle border border-border hover:border-border-strong transition-colors">
                    <Coins className="h-4 w-4 text-gold" />
                    <span className="text-sm font-semibold tabular-nums text-gold">{gcBalance.toLocaleString()}</span>
                    <span className="text-border-strong mx-0.5">|</span>
                    <Gem className="h-3.5 w-3.5 text-sweeps" />
                    <span className="text-sm font-semibold tabular-nums text-sweeps">{scBalance.toLocaleString()}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-fg-subtle ml-0.5" />
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
                    <DropdownMenuItem asChild>
                      <Link href="/insurance" className="cursor-pointer">
                        <ShieldCheck className="h-4 w-4" />
                        Position Insurance
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/playbooks" className="cursor-pointer">
                        <BookOpen className="h-4 w-4" />
                        Playbooks Marketplace
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notification bell */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-10 w-10 rounded-lg bg-bg-subtle border border-border hover:border-border-strong flex items-center justify-center transition-colors">
                    <Bell className="h-[18px] w-[18px] text-fg-muted" />
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

              {/* Deposit button */}
              <button
                onClick={() => setDepositOpen(true)}
                className="hidden sm:inline-flex h-10 px-4 rounded-lg bg-gradient-to-r from-brand to-brand-hover hover:opacity-90 text-white text-sm font-semibold transition-opacity shadow-[0_0_16px_-4px_rgba(99,102,241,0.5)] items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Deposit</span>
              </button>

              {/* User avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-9 w-9 rounded-full bg-gradient-to-br from-brand to-yes items-center justify-center text-sm font-semibold border border-border hover:border-border-strong transition-colors flex">
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
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={async () => {
                      try {
                        await fetch('/api/auth/signout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: mockUser.id }) })
                        await fetch('/api/auth/session', { method: 'DELETE' })
                        router.push('/signin')
                      } catch (err) {
                        console.error('Sign out failed:', err)
                      }
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ── Hamburger menu — visible on ALL screen sizes ── */}
              <button
                className="h-10 w-10 rounded-lg bg-bg-subtle border border-border hover:border-border-strong hover:bg-bg-elevated flex items-center justify-center transition-all active:scale-95"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5 text-fg-muted" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Command Palette (⌘K) */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search markets, categories, pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Pages */}
          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => runCommand(() => router.push('/markets'))}>
              <TrendingUp className="mr-2 h-4 w-4" /> Markets
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/playbooks'))}>
              <BookOpen className="mr-2 h-4 w-4" /> Playbooks
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/sponsored'))}>
              <Zap className="mr-2 h-4 w-4" /> Sponsored
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/portfolio'))}>
              <Briefcase className="mr-2 h-4 w-4" /> Portfolio
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/insurance'))}>
              <ShieldCheck className="mr-2 h-4 w-4" /> Insurance
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/withdrawal'))}>
              <ArrowDownToLine className="mr-2 h-4 w-4" /> Withdrawal
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/watchlist'))}>
              <BookmarkPlus className="mr-2 h-4 w-4" /> Watchlist
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/history'))}>
              <History className="mr-2 h-4 w-4" /> History
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/leaderboard'))}>
              <Trophy className="mr-2 h-4 w-4" /> Leaderboard
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/promotions'))}>
              <Tag className="mr-2 h-4 w-4" /> Promotions
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/referrals'))}>
              <Gift className="mr-2 h-4 w-4" /> Referrals
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/profile'))}>
              <User className="mr-2 h-4 w-4" /> Profile
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/docs'))}>
              <FileText className="mr-2 h-4 w-4" /> Docs
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/kyc'))}>
              <Shield className="mr-2 h-4 w-4" /> KYC
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Categories */}
          <CommandGroup heading="Categories">
            {categories.filter(c => c.id !== 'All').map((cat) => (
              <CommandItem
                key={cat.id}
                onSelect={() => runCommand(() => router.push(`/markets?category=${cat.id}`))}
              >
                <span className="mr-2">{cat.emoji}</span>
                {cat.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Markets */}
          <CommandGroup heading="Markets">
            {markets.map((m) => (
              <CommandItem
                key={m.id}
                onSelect={() => runCommand(() => router.push(`/markets/${m.id}`))}
              >
                <span className="mr-2">{m.imageEmoji}</span>
                <span className="flex-1 truncate">{m.question}</span>
                <span className="text-xs text-fg-muted ml-2 tabular-nums">
                  {Math.round((m.outcomes[0]?.price ?? 0.5) * 100)}%
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Mobile navigation drawer — accessible from hamburger on all screen sizes */}
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} onDeposit={() => { setMobileNavOpen(false); setDepositOpen(true) }} />

      {/* Deposit modal */}
      <DepositModal open={depositOpen} onOpenChange={setDepositOpen} />
    </>
  )
}
