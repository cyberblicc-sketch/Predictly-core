'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { mockUser } from '@/lib/mockData'
import {
  TrendingUp, Briefcase, User, Trophy,
  Gift, History, ChevronLeft, ChevronRight, Shield, Crown,
  BookmarkPlus, Tag, BookOpen, ShieldCheck, ChevronDown,
  ArrowDownToLine, FileText, Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
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
      { href: '/markets',   icon: TrendingUp,    label: 'Markets' },
      { href: '/playbooks', icon: BookOpen,      label: 'Playbooks' },
      { href: '/sponsored', icon: Zap,           label: 'Sponsored' },
      { href: '/watchlist', icon: BookmarkPlus,   label: 'Watchlist' },
    ],
  },
  {
    label: 'My Portfolio',
    items: [
      { href: '/portfolio',   icon: Briefcase,       label: 'Portfolio' },
      { href: '/insurance',   icon: ShieldCheck,     label: 'Insurance' },
      { href: '/withdrawal',  icon: ArrowDownToLine,  label: 'Withdrawal' },
      { href: '/history',     icon: History,          label: 'History' },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
      { href: '/promotions',  icon: Tag,    label: 'Promotions' },
      { href: '/referrals',   icon: Gift,   label: 'Referrals' },
    ],
  },
  {
    label: 'Account & Resources',
    items: [
      { href: '/profile', icon: User,     label: 'Profile' },
      { href: '/docs',    icon: FileText, label: 'Docs' },
      { href: '/kyc',     icon: Shield,   label: 'KYC' },
    ],
  },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [collapsedSections, setCollapsedSections] = React.useState<Record<string, boolean>>({})

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen bg-bg-subtle border-r border-border transition-all duration-300 sticky top-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand to-yes flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="gradient-text font-extrabold text-lg tracking-tight overflow-hidden whitespace-nowrap"
              >
                PREDICTLY
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navSections.map((section) => {
          const isSectionCollapsed = collapsedSections[section.label] ?? false
          const sectionHasActive = section.items.some(
            (item) => pathname === item.href || pathname.startsWith(item.href + '/')
          )

          return (
            <div key={section.label}>
              {/* Section header */}
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => toggleSection(section.label)}
                    className={cn(
                      'flex items-center justify-between w-full px-3 py-2 rounded-lg text-2xs font-semibold uppercase tracking-wider transition-colors',
                      sectionHasActive ? 'text-brand-hover' : 'text-fg-subtle hover:text-fg-muted'
                    )}
                  >
                    <span>{section.label}</span>
                    <motion.div
                      animate={{ rotate: isSectionCollapsed ? -90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </motion.div>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Collapsed mode: show only icons with a thin divider line */}
              {collapsed && (
                <>
                  <div className="my-2 mx-2 border-t border-border/50" />
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link key={item.href} href={item.href}>
                        <motion.div
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            'flex items-center justify-center px-0 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                            isActive
                              ? 'bg-brand-soft text-brand-hover'
                              : 'text-fg-muted hover:text-fg hover:bg-bg-elevated'
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="sidebar-active-indicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-brand"
                              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            />
                          )}
                          <item.icon className="w-5 h-5 shrink-0" />
                        </motion.div>
                      </Link>
                    )
                  })}
                </>
              )}

              {/* Expanded mode: section items with labels */}
              <AnimatePresence>
                {!collapsed && !isSectionCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                      return (
                        <Link key={item.href} href={item.href}>
                          <motion.div
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                              isActive
                                ? 'bg-brand-soft text-brand-hover'
                                : 'text-fg-muted hover:text-fg hover:bg-bg-elevated'
                            )}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="sidebar-active-indicator"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-brand"
                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                              />
                            )}
                            <item.icon className="w-5 h-5 shrink-0" />
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden whitespace-nowrap"
                            >
                              {item.label}
                            </motion.span>
                          </motion.div>
                        </Link>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      {/* User info at bottom */}
      <div className="p-3 border-t border-border">
        <div className={cn(
          'flex items-center gap-3 px-2 py-2 rounded-lg',
          collapsed && 'justify-center px-0'
        )}>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand to-yes flex items-center justify-center text-sm font-bold text-white shrink-0">
            {mockUser.username.charAt(0)}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold truncate">{mockUser.username}</span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gold-soft text-gold text-2xs font-semibold shrink-0">
                    <Crown className="h-3 w-3" /> Gold
                  </span>
                </div>
                <div className="text-2xs text-fg-muted truncate">{mockUser.email}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-fg-muted hover:text-fg hover:bg-bg-elevated transition-colors w-full mt-1',
            collapsed ? 'justify-center px-0' : ''
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
