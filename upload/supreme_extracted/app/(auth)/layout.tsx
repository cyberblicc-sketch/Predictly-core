import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { TrendingUp } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Supreme Fusion</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        <p>⚠️ 18+ only. Prediction markets are for entertainment.</p>
      </footer>
    </div>
  )
}