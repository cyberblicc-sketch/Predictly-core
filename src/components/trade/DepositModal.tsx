'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Coins, Gem, Sparkles, X, Tag } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const PACKAGES = [
  { label: 'Starter', gc: '1,000', sc: '5', price: '$4.99', popular: false, color: 'from-zinc-500/20 to-zinc-600/20' },
  { label: 'Bronze', gc: '5,000', sc: '25', price: '$19.99', popular: false, color: 'from-amber-600/20 to-amber-700/20' },
  { label: 'Silver', gc: '15,000', sc: '75', price: '$49.99', popular: true, color: 'from-gray-400/20 to-gray-500/20' },
  { label: 'Gold', gc: '40,000', sc: '200', price: '$99.99', popular: false, color: 'from-yellow-500/20 to-yellow-600/20' },
  { label: 'Diamond', gc: '100,000', sc: '500', price: '$249.99', popular: false, color: 'from-cyan-400/20 to-blue-500/20' },
]

interface DepositModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const [promoCode, setPromoCode] = useState('')
  const { toast } = useToast()

  const handleBuy = (pkg: typeof PACKAGES[number]) => {
    toast({
      title: 'Demo Mode',
      description: `Stripe checkout would start here for the ${pkg.label} package (${pkg.price})`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Coins className="h-5 w-5 text-gold" />
            Buy Gold Coins
          </DialogTitle>
          <DialogDescription>
            Purchase Gold Coins to trade on prediction markets. Each purchase includes free Sweeps Coins.
          </DialogDescription>
        </DialogHeader>

        {/* Package grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.label}
              className={`relative rounded-xl border p-4 bg-gradient-to-br ${pkg.color} border-border hover:border-brand/50 transition-colors ${
                pkg.popular ? 'sm:col-span-2' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-0.5 rounded-full bg-gradient-to-r from-brand to-brand-hover text-white text-2xs font-semibold">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-fg mb-1">{pkg.label}</div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Coins className="h-3.5 w-3.5 text-gold" />
                    <span className="text-lg font-bold text-gold tabular-nums">{pkg.gc} GC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-3.5 w-3.5 text-sweeps" />
                    <span className="text-sm font-medium text-sweeps tabular-nums">{pkg.sc} SC free</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-lg font-bold text-fg">{pkg.price}</div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-brand to-brand-hover hover:opacity-90 text-white text-xs font-semibold shadow-[0_0_12px_-4px_rgba(99,102,241,0.4)]"
                    onClick={() => handleBuy(pkg)}
                  >
                    Buy
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Promo code section */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-fg-muted" />
            <span className="text-sm font-medium text-fg">Have a promo code?</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 h-10 bg-bg-subtle border-border text-sm"
            />
            <Button
              variant="outline"
              className="h-10 px-4 border-border hover:border-brand"
              onClick={() => {
                if (promoCode.trim()) {
                  toast({
                    title: 'Demo Mode',
                    description: `Promo code "${promoCode}" would be validated and applied here`,
                  })
                }
              }}
            >
              Apply
            </Button>
          </div>
          <Link
            href="/promotions"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center gap-1 mt-2 text-xs text-brand hover:text-brand-hover transition-colors"
          >
            <Tag className="h-3 w-3" />
            Redeem promo code on Promotions page
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
