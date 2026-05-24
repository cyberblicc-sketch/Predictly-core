'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { mockUser } from '@/lib/mockData'
import {
  TrendingUp, Briefcase, User, Trophy,
  Gift, History, Shield, Coins, Gem, Crown, Plus,
  BookmarkPlus, Tag, BookOpen, ShieldCheck,
  ArrowDownToLine, FileText, Zap, X,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet'
import type { LucideIcon } from 'lucide-react'

interface MobileNavProps {
  open: boolean
  onClose: () => void
  onDeposit?: () => void
}

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
}

interface NavSection {
  label: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    label: 'Trade & Explore',
    items: [
      { href: '/markets',   icon: TrendingUp,   label: 'Markets' },
      { href: '/playbooks', icon: BookOpen,     label: 'Playbooks' },
      { href: '/sponsored', icon: Zap,          label: 'Sponsored' },
      { href: '/watchlist', icon: BookmarkPlus,  label: 'Watchlist' },
    ],
  },
  {
    label: 'My Portfolio',
    items: [
      { href: '/portfolio',    icon: Briefcase,      label: 'Portfolio' },
      { href: '/insurance',    icon: ShieldCheck,    label: 'Insurance' },
      { href: '/withdrawal',   icon: ArrowDownToLine, label: 'Withdrawal' },
      { href: '/history',      icon: History,        label: 'History' },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/leaderboard',  icon: Trophy,  label: 'Leaderboard' },
      { href: '/promotions',   icon: Tag,     label: 'Promotions' },
      { href: '/referrals',    icon: Gift,    label: 'Referrals' },
    ],
  },
  {
    label: 'Account & Resources',
    items: [
      { href: '/profile', icon: User,     label: 'Profile' },
      { href: '/docs',    icon: FileText, label: 'Docs' },
      { href: '/kyc',     icon: Shield,   label: 'KYC Verification' },
    ],
  },
]

export function MobileNav({ open, onClose, onDeposit }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent side="right" className="w-80 p-0 bg-bg-subtle border-l border-border flex flex-col">
        {/* ── Header: PREDICTLY gradient + close ── */}
        <SheetHeader className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-brand to-yes bg-clip-text text-transparent">
              PREDICTLY
            </span>
            <SheetClose asChild>
              <button
                aria-label="Close navigation"
                className="h-8 w-8 rounded-full flex items-center justify-center text-fg-muted hover:text-fg hover:bg-bg-elevated transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </SheetClose>
          </div>
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SheetDescription className="sr-only">Navigate to different sections of Predictly</SheetDescription>
        </SheetHeader>

        {/* ── User info section ── */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand to-yes flex items-center justify-center text-sm font-bold text-white shrink-0">
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

        {/* ── Navigation links grouped by section ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 max-h-[calc(100vh-340px)]">
          {navSections.map((section, sectionIdx) => (
            <div key={section.label}>
              {/* Section label */}
              <div className="px-3 pt-4 pb-2 text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
                {section.label}
              </div>

              {/* Section items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-brand-soft text-brand-hover'
                          : 'text-fg-muted hover:text-fg hover:bg-bg-elevated active:scale-[0.98]'
                      )}
                    >
                      <item.icon className={cn(
                        'w-5 h-5 shrink-0 transition-colors',
                        isActive ? 'text-brand' : 'text-fg-subtle'
                      )} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              {/* Divider between sections (except after last) */}
              {sectionIdx < navSections.length - 1 && (
                <div className="my-3 mx-3 border-t border-border/50" />
              )}
            </div>
          ))}
        </nav>

        {/* ── Deposit button at bottom ── */}
        <div className="p-4 border-t border-border mt-auto">
          <button
            onClick={onDeposit}
            className="w-full h-11 rounded-lg bg-gradient-to-r from-brand to-brand-hover hover:opacity-90 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-[0_0_16px_-4px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Deposit
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
