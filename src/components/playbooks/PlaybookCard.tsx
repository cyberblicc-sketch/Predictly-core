'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Star, Crown, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getTierBadgeColor, getTierLabel } from '@/lib/playbooks'
import type { Playbook, PlaybookTier } from '@/types'

interface PlaybookCardProps {
  playbook: Playbook
  featured?: boolean
  size?: 'default' | 'large'
}

export function PlaybookCard({ playbook, featured = false, size = 'default' }: PlaybookCardProps) {
  const isFree = playbook.price_monthly === 0

  return (
    <Link href={`/playbooks/${playbook.id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={cn(
          'group relative rounded-xl border border-border bg-bg-subtle overflow-hidden cursor-pointer',
          'hover:border-border-strong hover:shadow-card transition-colors',
          featured && 'ring-1 ring-gold/30'
        )}
      >
        {/* Cover gradient */}
        <div className={cn(
          'relative bg-gradient-to-br px-5 pt-5 pb-4',
          playbook.cover_color
        )}>
          {/* Featured badge */}
          {playbook.featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gold/90 text-black text-2xs font-bold gap-1 border-0">
                <Crown className="h-3 w-3" />
                FEATURED
              </Badge>
            </div>
          )}

          {/* Price badge */}
          <div className="absolute top-3 right-3">
            <Badge className={cn(
              'text-2xs font-bold border-0',
              isFree
                ? 'bg-yes/90 text-black'
                : 'bg-bg/80 text-fg backdrop-blur-sm'
            )}>
              {isFree ? 'Free' : `$${playbook.price_monthly}/mo`}
            </Badge>
          </div>

          {/* Emoji & Tier */}
          <div className="flex items-end gap-3">
            <span className={cn(
              'block leading-none',
              size === 'large' ? 'text-5xl' : 'text-4xl'
            )}>
              {playbook.cover_emoji}
            </span>
            <Badge className={cn('text-2xs font-semibold border-0 mb-1', getTierBadgeColor(playbook.tier))}>
              {getTierLabel(playbook.tier)}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Creator info */}
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{playbook.creator_avatar}</span>
            <span className="text-sm font-medium text-fg">{playbook.creator_username}</span>
            {playbook.creator_badge && (
              <Badge className={cn(
                'text-2xs font-semibold border-0 px-1.5 py-0',
                playbook.creator_badge === 'whale' && 'bg-blue-500/20 text-blue-400',
                playbook.creator_badge === 'sharp' && 'bg-emerald-500/20 text-emerald-400',
                playbook.creator_badge === 'rising' && 'bg-amber-500/20 text-amber-400',
                playbook.creator_badge === 'verified' && 'bg-purple-500/20 text-purple-400',
              )}>
                {playbook.creator_badge === 'whale' && '🐋'}
                {playbook.creator_badge === 'sharp' && '🎯'}
                {playbook.creator_badge === 'rising' && '🚀'}
                {playbook.creator_badge === 'verified' && '✓'}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className={cn(
            'font-semibold text-fg leading-snug',
            size === 'large' ? 'text-lg' : 'text-base'
          )}>
            {playbook.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-fg-muted line-clamp-2 leading-relaxed">
            {playbook.description}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-fg-muted">
              <TrendingUp className="h-3.5 w-3.5 text-yes" />
              <span className="font-medium text-fg">{(playbook.win_rate * 100).toFixed(0)}%</span>
              <span className="text-fg-subtle">win</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-fg-muted">
              <TrendingUp className="h-3.5 w-3.5 text-brand" />
              <span className="font-medium text-fg">+{(playbook.avg_return * 100).toFixed(0)}%</span>
              <span className="text-fg-subtle">avg</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-fg-muted">
              <Users className="h-3.5 w-3.5 text-fg-subtle" />
              <span className="font-medium text-fg">{playbook.subscriber_count}</span>
            </div>
          </div>

          {/* Rating & footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-gold fill-gold" />
              <span className="text-sm font-medium text-fg">{playbook.rating.toFixed(1)}</span>
              <span className="text-2xs text-fg-subtle">({playbook.rating_count})</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-fg-muted">
              <span>{playbook.total_posts} posts</span>
              {!isFree && (
                <Lock className="h-3 w-3 text-fg-subtle" />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
