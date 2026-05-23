'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { mockUser } from '@/lib/mockData'
import {
  LayoutDashboard, TrendingUp, Briefcase, User, Trophy,
  Gift, History, Shield, Wallet, Coins, Gem, Crown, Plus,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { href: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/markets',    icon: TrendingUp,      label: 'Markets' },
  { href: '/portfolio',  icon: Briefcase,       label: 'Portfolio' },
  { href: '/leaderboard',icon: Trophy,          label: 'Leaderboard' },
  { href: '/referrals',  icon: Gift,            label: 'Referrals' },
  { href: '/history',    icon: History,         label: 'History' },
  { href: '/profile',    icon: User,            label: 'Profile' },
  { href: '/kyc',        icon: Shield,          label: 'KYC' },
]

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent side="left" className="w-72 p-0 bg-bg-subtle border-r border-border">
        {/* Header with logo */}
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-yes flex items-center justify-center font-bold text-white text-sm">
              SF
            </div>
            <SheetTitle className="font-bold text-lg">Supreme Fusion</SheetTitle>
          </div>
          <SheetDescription className="sr-only">Navigation menu</SheetDescription>
        </SheetHeader>

        {/* User info section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand to-yes flex items-center justify-center text-sm font-bold text-white shrink-0">
              {mockUser.username.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold truncate">{mockUser.username}</span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gold-soft text-gold text-2xs font-semibold shrink-0">
                  <Crown className="h-3 w-3" /> Gold
                </span>
              </div>
              <div className="text-2xs text-fg-muted truncate">{mockUser.email}</div>
            </div>
          </div>

          {/* Dual currency balances */}
          <div className="flex gap-3">
            <div className="flex-1 rounded-lg bg-gold-soft border border-gold-border p-3">
              <div className="flex items-center gap-1.5 text-2xs text-gold mb-0.5">
                <Coins className="h-3 w-3" /> Gold Coins
              </div>
              <div className="text-base font-bold text-gold tabular-nums">
                {mockUser.gold_balance.toLocaleString()}
              </div>
            </div>
            <div className="flex-1 rounded-lg bg-sweeps-soft border border-sweeps-border p-3">
              <div className="flex items-center gap-1.5 text-2xs text-sweeps mb-0.5">
                <Gem className="h-3 w-3" /> Sweeps Coins
              </div>
              <div className="text-base font-bold text-sweeps tabular-nums">
                {mockUser.sweeps_balance.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-320px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-soft text-brand-hover'
                    : 'text-fg-muted hover:text-fg hover:bg-bg-elevated'
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Deposit button at bottom */}
        <div className="p-4 border-t border-border">
          <button className="w-full h-11 rounded-lg bg-gradient-to-r from-brand to-brand-hover hover:opacity-90 text-white text-sm font-semibold transition-opacity shadow-[0_0_16px_-4px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Deposit
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
