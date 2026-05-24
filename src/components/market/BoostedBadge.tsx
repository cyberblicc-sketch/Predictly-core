'use client'

import { Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { BoostPlacement } from '@/types'
import { cn } from '@/lib/utils'

// ── Placement Colors ─────────────────────────────────────────────────────────

const PLACEMENT_STYLES: Record<BoostPlacement, string> = {
  hero: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400',
  featured: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400',
  category_top: 'bg-violet-500/15 text-violet-600 border-violet-500/30 dark:text-violet-400',
  sidebar: 'bg-sky-500/15 text-sky-600 border-sky-500/30 dark:text-sky-400',
  ticker: 'bg-rose-500/15 text-rose-600 border-rose-500/30 dark:text-rose-400',
}

const PLACEMENT_LABELS: Record<BoostPlacement, string> = {
  hero: 'Hero Banner',
  featured: 'Featured',
  category_top: 'Category Top',
  sidebar: 'Sidebar',
  ticker: 'Ticker',
}

// ── Component ────────────────────────────────────────────────────────────────

interface BoostedBadgeProps {
  placement: BoostPlacement
  sponsorName: string
  className?: string
}

export function BoostedBadge({ placement, sponsorName, className }: BoostedBadgeProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={cn(
              'relative cursor-default gap-1 font-semibold text-2xs overflow-hidden',
              'animate-pulse-subtle',
              PLACEMENT_STYLES[placement],
              className
            )}
          >
            {/* Animated glow background */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

            <Zap className="h-3 w-3 fill-current" />
            <span className="relative">BOOSTED</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="flex flex-col gap-1">
            <span className="font-semibold">
              Sponsored · {PLACEMENT_LABELS[placement]}
            </span>
            <span className="text-fg-muted">Paid for by {sponsorName}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
