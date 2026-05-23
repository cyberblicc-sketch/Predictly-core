'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { mockUser } from '@/lib/mockData'
import {
  LayoutDashboard, TrendingUp, Briefcase, User, Trophy,
  Gift, History, ChevronLeft, ChevronRight, Shield, Crown,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { href: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/markets',    icon: TrendingUp,      label: 'Markets' },
  { href: '/portfolio',  icon: Briefcase,       label: 'Portfolio' },
  { href: '/history',    icon: History,         label: 'History' },
  { href: '/leaderboard',icon: Trophy,          label: 'Leaderboard' },
  { href: '/referrals',  icon: Gift,            label: 'Referrals' },
  { href: '/profile',    icon: User,            label: 'Profile' },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen bg-bg-subtle border-r border-border transition-all duration-300 sticky top-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand to-yes flex items-center justify-center font-bold text-white text-sm shrink-0">
            PR
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-lg tracking-tight overflow-hidden whitespace-nowrap"
              >
                Predictly
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
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
                    : 'text-fg-muted hover:text-fg hover:bg-bg-elevated',
                  collapsed && 'justify-center px-0'
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
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* KYC link */}
      <div className="px-3 pb-2">
        <Link href="/kyc">
          <motion.div
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-fg-muted hover:text-fg hover:bg-bg-elevated transition-colors',
              collapsed && 'justify-center px-0'
            )}
          >
            <Shield className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Verify KYC
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>
      </div>

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
