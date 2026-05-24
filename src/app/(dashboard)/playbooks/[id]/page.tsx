'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, BookOpen, Users, TrendingUp, Star, Lock,
  Heart, MessageCircle, ChevronDown, ChevronUp, Crown,
  Check, Zap, Shield, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  MOCK_PLAYBOOKS,
  MOCK_PLAYBOOK_POSTS,
  MOCK_PLAYBOOK_CREATORS,
  MOCK_PLAYBOOK_SUBSCRIPTIONS,
  getTierBadgeColor,
  getTierLabel,
  getPositionTypeColor,
  getPositionTypeLabel,
} from '@/lib/playbooks'
import type { Playbook, PlaybookPost, PlaybookCreator } from '@/types'

export default function PlaybookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [playbook, setPlaybook] = React.useState<Playbook | null>(null)
  const [posts, setPosts] = React.useState<PlaybookPost[]>([])
  const [isSubscribed, setIsSubscribed] = React.useState(false)
  const [totalPosts, setTotalPosts] = React.useState(0)
  const [freePostsCount, setFreePostsCount] = React.useState(0)
  const [expandedPosts, setExpandedPosts] = React.useState<Set<string>>(new Set())
  const [subscribing, setSubscribing] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchPlaybook() {
      try {
        const res = await fetch(`/api/playbooks/${id}`)
        if (res.ok) {
          const data = await res.json()
          setPlaybook(data.playbook)
          setPosts(data.posts)
          setIsSubscribed(data.isSubscribed)
          setTotalPosts(data.totalPosts)
          setFreePostsCount(data.freePostsCount)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchPlaybook()
  }, [id])

  const creator = React.useMemo(() => {
    if (!playbook) return null
    return MOCK_PLAYBOOK_CREATORS.find(c => c.id === playbook.creator_id) ?? null
  }, [playbook])

  const togglePost = (postId: string) => {
    setExpandedPosts(prev => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  const handleSubscribe = async () => {
    setSubscribing(true)
    try {
      const res = await fetch(`/api/playbooks/${id}/subscribe`, { method: 'POST' })
      if (res.ok) {
        setIsSubscribed(true)
        // Refetch to get all posts
        const detailRes = await fetch(`/api/playbooks/${id}`)
        if (detailRes.ok) {
          const data = await detailRes.json()
          setPosts(data.posts)
          setTotalPosts(data.totalPosts)
        }
      }
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 skeleton rounded-lg" />
        <div className="h-64 skeleton rounded-2xl" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!playbook) {
    return (
      <div className="text-center py-20">
        <BookOpen className="h-12 w-12 text-fg-subtle mx-auto mb-3" />
        <h2 className="text-xl font-bold text-fg mb-1">Playbook not found</h2>
        <p className="text-sm text-fg-muted mb-4">This playbook may have been removed or doesn&apos;t exist.</p>
        <Button variant="outline" onClick={() => router.push('/playbooks')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Playbooks
        </Button>
      </div>
    )
  }

  const isFree = playbook.price_monthly === 0
  const lockedPosts = totalPosts - freePostsCount

  return (
    <div className="space-y-6 pb-4">
      {/* Back button */}
      <button
        onClick={() => router.push('/playbooks')}
        className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Playbooks
      </button>

      {/* ── Playbook Header ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border">
        {/* Cover gradient */}
        <div className={cn('relative bg-gradient-to-br p-6 sm:p-8', playbook.cover_color)}>
          <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_20%_20%,rgba(255,255,255,0.03),transparent_60%)]" />
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <span className="text-6xl sm:text-7xl leading-none">{playbook.cover_emoji}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold text-fg">{playbook.title}</h1>
                    {playbook.featured && (
                      <Badge className="bg-gold/90 text-black text-2xs font-bold border-0 gap-1">
                        <Crown className="h-3 w-3" /> FEATURED
                      </Badge>
                    )}
                  </div>
                  <Badge className={cn('text-xs font-semibold border-0', getTierBadgeColor(playbook.tier))}>
                    {getTierLabel(playbook.tier)}
                  </Badge>
                  <span className="text-fg-muted text-sm ml-2">{playbook.category}</span>
                </div>
              </div>

              {/* Subscribe button */}
              {isSubscribed ? (
                <Badge className="bg-yes-soft text-yes border-0 px-4 py-2 text-sm font-semibold">
                  <Check className="h-4 w-4 mr-1.5" /> Subscribed
                </Badge>
              ) : (
                <Button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className={cn(
                    'font-semibold shrink-0',
                    isFree
                      ? 'bg-yes hover:bg-yes/90 text-black'
                      : 'bg-brand hover:bg-brand-hover text-white'
                  )}
                >
                  <Zap className="h-4 w-4 mr-1.5" />
                  {subscribing ? 'Subscribing...' : isFree ? 'Subscribe Free' : `Subscribe for $${playbook.price_monthly}/mo`}
                </Button>
              )}
            </div>

            <p className="text-fg-muted mt-4 max-w-2xl text-sm sm:text-base leading-relaxed">
              {playbook.description}
            </p>

            {/* Tags */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {playbook.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-2xs text-fg-muted border-border-strong">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-border">
          {[
            { label: 'Win Rate', value: `${(playbook.win_rate * 100).toFixed(0)}%`, icon: <TrendingUp className="h-4 w-4 text-yes" /> },
            { label: 'Avg Return', value: `+${(playbook.avg_return * 100).toFixed(0)}%`, icon: <TrendingUp className="h-4 w-4 text-brand" /> },
            { label: 'Subscribers', value: `${playbook.subscriber_count}${playbook.max_subscribers ? `/${playbook.max_subscribers}` : ''}`, icon: <Users className="h-4 w-4 text-fg-subtle" /> },
            { label: 'Posts', value: `${playbook.total_posts}`, icon: <BookOpen className="h-4 w-4 text-fg-subtle" /> },
            { label: 'Rating', value: `${playbook.rating.toFixed(1)} (${playbook.rating_count})`, icon: <Star className="h-4 w-4 text-gold fill-gold" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-bg-subtle p-4 flex items-center gap-2">
              {stat.icon}
              <div>
                <div className="text-xs text-fg-subtle">{stat.label}</div>
                <div className="text-sm font-semibold text-fg">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* ── Posts List ────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Posts</h2>
            {!isSubscribed && lockedPosts > 0 && (
              <span className="text-xs text-fg-muted">
                {freePostsCount} free · {lockedPosts} locked
              </span>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-bg-subtle border border-border">
              <BookOpen className="h-10 w-10 text-fg-subtle mx-auto mb-2" />
              <p className="text-sm text-fg-muted">No posts yet</p>
            </div>
          ) : (
            <AnimatePresence>
              {posts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl bg-bg-subtle border border-border overflow-hidden"
                >
                  {/* Post header */}
                  <button
                    onClick={() => togglePost(post.id)}
                    className="w-full text-left p-4 flex items-start gap-3 hover:bg-bg-elevated/50 transition-colors"
                  >
                    <Badge className={cn('text-2xs font-semibold border-0 shrink-0 mt-0.5', getPositionTypeColor(post.position_type))}>
                      {getPositionTypeLabel(post.position_type)}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-fg leading-snug">{post.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-2xs text-fg-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {post.comments_count}
                        </span>
                      </div>
                    </div>
                    {expandedPosts.has(post.id) ? (
                      <ChevronUp className="h-4 w-4 text-fg-subtle shrink-0 mt-0.5" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-fg-subtle shrink-0 mt-0.5" />
                    )}
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {expandedPosts.has(post.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0">
                          <Separator className="mb-3" />
                          <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-wrap">
                            {post.content}
                          </p>

                          {/* Outcomes shared */}
                          {post.outcomes_shared.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <div className="text-xs font-semibold text-fg-subtle uppercase tracking-wider">Positions Shared</div>
                              {post.outcomes_shared.map((outcome, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated border border-border"
                                >
                                  <div className="flex items-center gap-2">
                                    <Badge className={cn(
                                      'text-2xs font-bold border-0',
                                      outcome.side === 'YES' ? 'bg-yes-soft text-yes' : 'bg-no-soft text-no'
                                    )}>
                                      {outcome.side}
                                    </Badge>
                                    <span className="text-sm text-fg">
                                      {outcome.shares.toLocaleString()} shares @ {outcome.entry_price.toFixed(2)}¢
                                    </span>
                                  </div>
                                  <span className={cn(
                                    'text-sm font-medium tabular-nums',
                                    outcome.pnl >= 0 ? 'text-yes' : 'text-no'
                                  )}>
                                    {outcome.pnl >= 0 ? '+' : ''}{outcome.pnl.toFixed(0)} SC
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {post.is_free_preview && (
                            <div className="mt-3">
                              <Badge variant="outline" className="text-2xs text-yes border-yes/30">
                                <Shield className="h-3 w-3 mr-1" /> Free Preview
                              </Badge>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Locked posts teaser */}
          {!isSubscribed && lockedPosts > 0 && (
            <div className="rounded-xl bg-bg-subtle border border-dashed border-border-strong p-6 text-center">
              <Lock className="h-8 w-8 text-fg-subtle mx-auto mb-3" />
              <h3 className="text-base font-semibold text-fg mb-1">
                {lockedPosts} more post{lockedPosts !== 1 ? 's' : ''} locked
              </h3>
              <p className="text-sm text-fg-muted mb-4">
                Subscribe to unlock all posts and get full access to analysis & positions
              </p>
              <Button
                onClick={handleSubscribe}
                disabled={subscribing}
                className={cn(
                  'font-semibold',
                  isFree ? 'bg-yes hover:bg-yes/90 text-black' : 'bg-brand hover:bg-brand-hover text-white'
                )}
              >
                <Zap className="h-4 w-4 mr-1.5" />
                {isFree ? 'Subscribe Free' : `Subscribe for $${playbook.price_monthly}/mo`}
              </Button>
            </div>
          )}
        </div>

        {/* ── Creator Sidebar ────────────────────────────────────────── */}
        {creator && (
          <div className="space-y-4">
            <div className="rounded-xl bg-bg-subtle border border-border p-5 space-y-4">
              <h3 className="text-sm font-semibold text-fg-subtle uppercase tracking-wider">Creator</h3>

              <div className="flex items-center gap-3">
                <span className="text-4xl leading-none">{creator.avatar}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-semibold text-fg">{creator.username}</span>
                    {creator.badge && (
                      <Badge className={cn(
                        'text-2xs font-semibold border-0 px-1.5 py-0',
                        creator.badge === 'whale' && 'bg-blue-500/20 text-blue-400',
                        creator.badge === 'sharp' && 'bg-emerald-500/20 text-emerald-400',
                        creator.badge === 'rising' && 'bg-amber-500/20 text-amber-400',
                        creator.badge === 'verified' && 'bg-purple-500/20 text-purple-400',
                      )}>
                        {creator.badge === 'whale' && '🐋'}
                        {creator.badge === 'sharp' && '🎯'}
                        {creator.badge === 'rising' && '🚀'}
                        {creator.badge === 'verified' && '✓'}
                      </Badge>
                    )}
                  </div>
                  {creator.verified_at && (
                    <div className="flex items-center gap-1 text-2xs text-yes mt-0.5">
                      <Check className="h-3 w-3" /> Verified Creator
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-fg-muted leading-relaxed">{creator.bio}</p>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fg-muted">Win Rate</span>
                  <span className="font-medium text-fg">{(creator.win_rate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fg-muted">Avg Return</span>
                  <span className="font-medium text-yes">+{(creator.avg_return * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fg-muted">Playbooks</span>
                  <span className="font-medium text-fg">{creator.total_playbooks}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fg-muted">Subscribers</span>
                  <span className="font-medium text-fg">{creator.total_subscribers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fg-muted">Total Earnings</span>
                  <span className="font-medium text-gold">${creator.total_earnings.toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-xs text-fg-subtle mb-2">Specialties</div>
                <div className="flex flex-wrap gap-1.5">
                  {creator.specialties.map(s => (
                    <Badge key={s} variant="outline" className="text-2xs text-fg-muted border-border-strong">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-xl bg-bg-subtle border border-border p-5 space-y-3">
              <h3 className="text-sm font-semibold text-fg-subtle uppercase tracking-wider">Playbook Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-bg-elevated">
                  <div className="text-xs text-fg-subtle">Open Positions</div>
                  <div className="text-lg font-bold text-fg">{playbook.open_positions}</div>
                </div>
                <div className="p-3 rounded-lg bg-bg-elevated">
                  <div className="text-xs text-fg-subtle">Status</div>
                  <div className="text-lg font-bold text-yes capitalize">{playbook.status}</div>
                </div>
                <div className="p-3 rounded-lg bg-bg-elevated">
                  <div className="text-xs text-fg-subtle">Created</div>
                  <div className="text-sm font-medium text-fg">
                    {new Date(playbook.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-bg-elevated">
                  <div className="text-xs text-fg-subtle">Last Post</div>
                  <div className="text-sm font-medium text-fg">
                    {new Date(playbook.last_post_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
