'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  User,
  Trophy,
  Gift,
  History,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/markets', icon: TrendingUp, label: 'Markets' },
  { href: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/referrals', icon: Gift, label: 'Referrals' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen bg-card border-r transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg">Supreme Fusion</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  collapsed && 'justify-center px-0 w-10'
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <Link href="/kyc">
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start gap-3',
              collapsed && 'justify-center px-0 w-10'
            )}
          >
            <Shield className="w-5 h-5" />
            {!collapsed && <span>Verify KYC</span>}
          </Button>
        </Link>
      </div>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          onClick={onToggle}
          className={cn(
            'w-full justify-center',
            !collapsed && 'justify-start'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 mr-2" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}