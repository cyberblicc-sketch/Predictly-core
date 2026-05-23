'use client'

import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DisclaimerProps {
  /** Use compact mode for inline/sidebar usage */
  compact?: boolean
  /** Additional CSS classes */
  className?: string
}

export function Disclaimer({ compact = false, className }: DisclaimerProps) {
  return (
    <div className={cn('mx-auto max-w-[1400px] px-4 sm:px-6', compact ? 'py-2' : 'py-4', className)}>
      <div
        className={cn(
          'rounded-lg border p-4 transition-colors',
          compact ? 'bg-bg-subtle border-warn/30' : 'bg-bg-subtle border-warn/40'
        )}
      >
        <div className="flex gap-3">
          <AlertTriangle className={cn('shrink-0 text-warn', compact ? 'h-3.5 w-3.5 mt-0.5' : 'h-4 w-4 mt-0.5')} />
          <div>
            {compact ? (
              <p className="text-2xs text-fg-subtle leading-relaxed">
                <strong className="text-fg-muted">Disclaimer:</strong>{' '}
                Entertainment only. 18+ required. GC has no monetary value. SC redeemable after KYC. AMOE available. Void where prohibited.
              </p>
            ) : (
              <>
                <p className="text-sm font-semibold text-warn mb-1.5">
                  Important Disclaimer
                </p>
                <div className="text-xs text-fg-subtle leading-relaxed space-y-2">
                  <p>
                    Supreme Fusion is a dual-currency prediction market platform designed for{' '}
                    <strong className="text-fg-muted">entertainment purposes only</strong>. Gold Coins (GC)
                    are virtual currency with no monetary value and cannot be redeemed for real money or prizes.
                  </p>
                  <p>
                    Sweeps Coins (SC) can be redeemed for real prizes after completing{' '}
                    <strong className="text-fg-muted">KYC verification</strong> and meeting all applicable requirements.
                    Must be <strong className="text-fg-muted">18 years or older</strong> to participate.
                    An <strong className="text-fg-muted">Alternative Method of Entry (AMOE)</strong> is available
                    — no purchase necessary to receive Sweeps Coins.
                  </p>
                  <p>
                    Void where prohibited. Past performance does not guarantee future results.
                    Trading involves risk and may not be suitable for all participants.
                    Please trade responsibly and within your means.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
