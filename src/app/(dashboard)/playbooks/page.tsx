'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Search, TrendingUp, Users, Star, Sparkles,
  ArrowRight, ChevronRight, Crown, Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { PlaybookCard } from '@/components/playbooks/PlaybookCard'
import {
  MOCK_PLAYBOOKS,
  MOCK_PLAYBOOK_CREATORS,
  MOCK_PLAYBOOK_SUBSCRIPTIONS,
  filterPlaybooks,
  getBadgeColor,
  getBadgeIcon,
} from '@/lib/playbooks'
import type { Category, PlaybookTier } from '@/types'

const CATEGORIES: (Category | 'All')[] = [
  'All', 'Politics', 'Crypto', 'Sports', 'Tech',
  'Economics', 'Pop Culture', 'Science', 'World', 'Stocks',
]

const TIER_FILTERS: { value: PlaybookTier | 'all'; label: string }[] = [
  { value: 'all', label: 'All Tiers' },
  { value: 'free', label: 'Free' },
  { value: 'basic', label: 'Basic' },
  { value: 'premium', label: 'Premium' },
  { value: 'elite', label: 'Elite' },
]

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'return', label: 'Best Returns' },
]

export default function PlaybooksPage() {
  const [search, setSearch] = React.useState('')
  const [category, setCategory] = React.useState<Category | 'All'>('All')
  const [tier, setTier] = React.useState<PlaybookTier | 'all'>('all')
  const [sort, setSort] = React.useState<'popular' | 'newest' | 'rating' | 'return'>('popular')
  const [selectedCreator, setSelectedCreator] = React.useState<string | null>(null)
  const [showCount, setShowCount] = React.useState(6)

  const filteredPlaybooks = React.useMemo(() => {
    return filterPlaybooks(MOCK_PLAYBOOKS, {
      category,
      tier,
      search,
      sort,
      creatorId: selectedCreator ?? undefined,
    })
  }, [category, tier, search, sort, selectedCreator])

  const featuredPlaybooks = MOCK_PLAYBOOKS.filter(p => p.featured)
  const mySubscriptions = MOCK_PLAYBOOK_SUBSCRIPTIONS.filter(s => s.status === 'active')

  return (
    <div className="space-y-8 pb-4">
      {/* ── Section 1: Hero Banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand/20 via-bg-subtle to-yes/10 border border-border p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_30%_20%,rgba(99,102,241,0.1),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand/20">
              <BookOpen className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
                Playbooks Marketplace
              </h1>
            </div>
          </div>
          <p className="text-fg-muted text-sm sm:text-base max-w-xl mb-6">
            Follow the best traders. Learn their strategies. Profit together.
            Subscribe to playbooks and get real-time analysis, position tracking, and market insights.
          </p>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
              <Input
                placeholder="Search playbooks, creators, or tags..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowCount(6) }}
                className="pl-9 bg-bg/60 border-border-strong"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {TIER_FILTERS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setTier(t.value); setShowCount(6) }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    tier === t.value
                      ? 'bg-brand text-white'
                      : 'bg-bg-elevated text-fg-muted hover:text-fg hover:bg-bg-hover'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setShowCount(6) }}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  category === cat
                    ? 'bg-brand-soft text-brand-hover border border-brand/30'
                    : 'bg-bg-elevated text-fg-muted hover:text-fg border border-transparent'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 2: Featured Playbooks Carousel ─────────────────────── */}
      {featuredPlaybooks.length > 0 && !selectedCreator && category === 'All' && !search && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              <h2 className="text-lg font-semibold">Featured Playbooks</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
            {featuredPlaybooks.map((pb) => (
              <div key={pb.id} className="shrink-0 w-[340px] sm:w-[380px]">
                <PlaybookCard playbook={pb} featured size="large" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Section 3: Top Creators Row ─────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold">Top Creators</h2>
          </div>
          {selectedCreator && (
            <button
              onClick={() => setSelectedCreator(null)}
              className="text-xs text-brand hover:text-brand-hover flex items-center gap-1 transition-colors"
            >
              Clear filter <span className="text-fg-subtle">×</span>
            </button>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
          {MOCK_PLAYBOOK_CREATORS.map((creator) => (
            <motion.button
              key={creator.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedCreator(selectedCreator === creator.id ? null : creator.id)
                setShowCount(6)
              }}
              className={cn(
                'shrink-0 flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors min-w-[120px]',
                selectedCreator === creator.id
                  ? 'bg-brand-soft border-brand/30'
                  : 'bg-bg-subtle border-border hover:border-border-strong'
              )}
            >
              <span className="text-3xl">{creator.avatar}</span>
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <span className="text-sm font-medium text-fg">{creator.username}</span>
                  {creator.badge && (
                    <Badge className={cn('text-2xs font-semibold border-0 px-1 py-0', getBadgeColor(creator.badge))}>
                      {getBadgeIcon(creator.badge)}
                    </Badge>
                  )}
                </div>
                <div className="text-2xs text-fg-muted mt-0.5">
                  {(creator.win_rate * 100).toFixed(0)}% win · {creator.total_subscribers} subs
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── Section 5: My Subscriptions ─────────────────────────────────── */}
      {mySubscriptions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">My Subscriptions</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySubscriptions.map((sub) => {
              const pb = MOCK_PLAYBOOKS.find(p => p.id === sub.playbook_id)
              if (!pb) return null
              return (
                <div key={sub.id} className="flex items-center gap-3 p-4 rounded-xl bg-bg-subtle border border-border">
                  <span className="text-2xl">{pb.cover_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-fg truncate">{pb.title}</div>
                    <div className="text-2xs text-fg-muted">
                      by {pb.creator_username} · {sub.price_at_subscribe > 0 ? `${sub.price_at_subscribe} SC/mo` : 'Free'}
                    </div>
                  </div>
                  <Badge className="bg-yes-soft text-yes text-2xs border-0 shrink-0">
                    Active
                  </Badge>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Section 4: All Playbooks Grid ───────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold">
              {selectedCreator
                ? `${MOCK_PLAYBOOK_CREATORS.find(c => c.id === selectedCreator)?.username}'s Playbooks`
                : 'All Playbooks'
              }
            </h2>
            <span className="text-sm text-fg-muted">({filteredPlaybooks.length})</span>
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="w-[160px] bg-bg-subtle border-border h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredPlaybooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-fg-subtle mx-auto mb-3" />
            <h3 className="text-lg font-medium text-fg mb-1">No playbooks found</h3>
            <p className="text-sm text-fg-muted">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPlaybooks.slice(0, showCount).map((pb) => (
                <PlaybookCard key={pb.id} playbook={pb} />
              ))}
            </div>

            {showCount < filteredPlaybooks.length && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowCount(prev => prev + 6)}
                  className="bg-bg-subtle border-border hover:bg-bg-elevated"
                >
                  Load More
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Section 6: Creator CTA ─────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yes/10 via-bg-subtle to-brand/10 border border-border p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(500px_circle_at_70%_80%,rgba(0,210,132,0.08),transparent_60%)]" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-fg mb-1">Are you a top trader?</h2>
            <p className="text-sm text-fg-muted max-w-md">
              Start earning from your insights. Create your playbook and let others subscribe to follow your plays.
            </p>
          </div>
          <Button className="bg-yes hover:bg-yes/90 text-black font-semibold shrink-0">
            <Plus className="h-4 w-4 mr-1.5" />
            Create Playbook
          </Button>
        </div>
      </section>
    </div>
  )
}
