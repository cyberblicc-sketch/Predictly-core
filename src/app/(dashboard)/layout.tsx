'use client'

import * as React from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { Footer } from '@/components/layout/Footer'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar — desktop only */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Sticky header */}
        <Header />

        {/* Page content */}
        <main className="flex-1">
          <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
            {children}
          </div>
        </main>

        {/* Footer sticks to bottom */}
        <Footer />
      </div>

      {/* Mobile navigation drawer */}
      <MobileNav
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  )
}
