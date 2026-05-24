'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  AlertTriangle,
  ScrollText,
  Settings,
  LogOut,
  Shield,
  Loader2,
  RadioTower,
  Zap,
  Rocket,
  Bot,
  Droplets,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

const adminNavItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/markets', icon: TrendingUp, label: 'Markets' },
  { href: '/admin/ai-employees', icon: Bot, label: 'AI Employees' },
  { href: '/admin/maas', icon: Zap, label: 'MaaS' },
  { href: '/admin/wisdom-feed', icon: RadioTower, label: 'Wisdom Feed' },
  { href: '/admin/boosted', icon: Rocket, label: 'Boosted Markets' },
  { href: '/admin/pool-solvency', icon: Droplets, label: 'Pool Solvency' },
  { href: '/admin/disputes', icon: AlertTriangle, label: 'Disputes' },
  { href: '/admin/logs', icon: ScrollText, label: 'Logs' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(true)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)

  React.useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/check')
        const data = await res.json()
        if (data.isAdmin) {
          setIsAuthenticated(true)
        } else {
          router.replace('/admin/login')
        }
      } catch {
        router.replace('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      // Clear the admin session cookie
      document.cookie = 'admin_session=; path=/; max-age=0'
      router.replace('/admin/login')
    } catch {
      // Still redirect even if cookie clearing fails
      router.replace('/admin/login')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-fg-muted text-sm">Verifying admin session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-bg-subtle border-r border-border shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand to-yes flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-fg">Admin Panel</div>
              <div className="text-2xs text-fg-muted">Predictly</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-3 space-y-1">
            {adminNavItems.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                      isActive
                        ? 'bg-brand-soft text-brand-hover'
                        : 'text-fg-muted hover:text-fg hover:bg-bg-elevated'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-brand" />
                    )}
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        <Separator />

        {/* Logout */}
        <div className="p-3">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-fg-muted hover:text-no hover:bg-no-soft"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-bg-subtle">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-yes flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm">Admin Panel</span>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/admin"
              className={cn(
                'p-2 rounded-lg text-xs',
                pathname === '/admin' ? 'bg-brand-soft text-brand' : 'text-fg-muted'
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/users"
              className={cn(
                'p-2 rounded-lg text-xs',
                pathname.startsWith('/admin/users') ? 'bg-brand-soft text-brand' : 'text-fg-muted'
              )}
            >
              <Users className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/markets"
              className={cn(
                'p-2 rounded-lg text-xs',
                pathname.startsWith('/admin/markets') ? 'bg-brand-soft text-brand' : 'text-fg-muted'
              )}
            >
              <TrendingUp className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/maas"
              className={cn(
                'p-2 rounded-lg text-xs',
                pathname.startsWith('/admin/maas') ? 'bg-brand-soft text-brand' : 'text-fg-muted'
              )}
            >
              <Zap className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/wisdom-feed"
              className={cn(
                'p-2 rounded-lg text-xs',
                pathname.startsWith('/admin/wisdom-feed') ? 'bg-brand-soft text-brand' : 'text-fg-muted'
              )}
            >
              <RadioTower className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/boosted"
              className={cn(
                'p-2 rounded-lg text-xs',
                pathname.startsWith('/admin/boosted') ? 'bg-brand-soft text-brand' : 'text-fg-muted'
              )}
            >
              <Rocket className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/ai-employees"
              className={cn(
                'p-2 rounded-lg text-xs',
                pathname.startsWith('/admin/ai-employees') ? 'bg-brand-soft text-brand' : 'text-fg-muted'
              )}
            >
              <Bot className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/pool-solvency"
              className={cn(
                'p-2 rounded-lg text-xs',
                pathname.startsWith('/admin/pool-solvency') ? 'bg-brand-soft text-brand' : 'text-fg-muted'
              )}
            >
              <Droplets className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/settings"
              className={cn(
                'p-2 rounded-lg text-xs',
                pathname.startsWith('/admin/settings') ? 'bg-brand-soft text-brand' : 'text-fg-muted'
              )}
            >
              <Settings className="h-4 w-4" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-fg-muted hover:text-no p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
