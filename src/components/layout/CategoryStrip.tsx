'use client'

import { cn } from '@/lib/utils'

interface CategoryStripProps {
  active: string
  onChange: (id: string) => void
}

const CATEGORIES = [
  { id: 'All',          emoji: '🔥', label: 'All' },
  { id: 'Politics',     emoji: '🗳️', label: 'Politics' },
  { id: 'Crypto',       emoji: '₿',  label: 'Crypto' },
  { id: 'Sports',       emoji: '🏆', label: 'Sports' },
  { id: 'Tech',         emoji: '🤖', label: 'Tech' },
  { id: 'Economics',    emoji: '📈', label: 'Economics' },
  { id: 'Pop Culture',  emoji: '🎬', label: 'Pop Culture' },
  { id: 'Science',      emoji: '🔬', label: 'Science' },
  { id: 'World',        emoji: '🌍', label: 'World' },
  { id: 'Stocks',       emoji: '📊', label: 'Stocks' },
] as const

export function CategoryStrip({ active, onChange }: CategoryStripProps) {
  return (
    <div className="border-b border-border glass sticky top-16 z-30">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-3">
          {CATEGORIES.map((c) => {
            const isActive = active === c.id
            return (
              <button
                key={c.id}
                onClick={() => onChange(c.id)}
                className={cn(
                  'shrink-0 px-3.5 h-9 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all duration-200',
                  isActive
                    ? 'bg-fg text-bg shadow-sm'
                    : 'bg-bg-subtle text-fg-muted hover:text-fg hover:bg-bg-elevated border border-border'
                )}
              >
                <span aria-hidden>{c.emoji}</span>
                {c.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
