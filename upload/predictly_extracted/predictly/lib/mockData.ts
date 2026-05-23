// Realistic mock data for the prediction market UI.
// All markets, history points, leaderboard rows, portfolio positions, and
// activity feed entries live here so pages can stay focused on layout.

export type Category =
  | 'Politics' | 'Crypto' | 'Sports' | 'Tech' | 'Economics'
  | 'Pop Culture' | 'Science' | 'World'

export type MarketOutcome = {
  id: string
  label: string          // "Yes", "Donald Trump", "Warriors", ...
  price: number          // 0..1 — implied probability
  volume: number         // USD traded on this outcome
  // 7-day delta in probability (e.g. +0.04 = +4 percentage points).
  delta7d: number
}

export type Market = {
  id: string
  slug: string
  question: string
  shortTitle: string
  description: string
  category: Category
  tags: string[]
  // For binary markets, use [Yes, No] outcomes.
  // For categorical markets (e.g. "Who will win the election?"), 3+ outcomes.
  outcomes: MarketOutcome[]
  volume: number            // total USD volume
  liquidity: number         // current AMM/order book depth in USD
  traders: number
  closeAt: string           // ISO date string
  createdAt: string         // ISO
  resolver: string          // who resolves the market
  imageColor: string        // tailwind color class for fallback tile
  imageEmoji: string        // emoji used as the market avatar
  trending?: boolean
  isNew?: boolean
}

// 7-day price history per market. Each entry is the YES price (0..1) at
// roughly hourly intervals.
export function makePriceHistory(
  start: number, end: number, points = 96, noise = 0.04
): { t: number; price: number }[] {
  const out: { t: number; price: number }[] = []
  const span = points - 1
  const now = Date.now()
  const HOUR = 60 * 60 * 1000
  for (let i = 0; i < points; i++) {
    const progress = i / span
    // Sinusoidal walk + linear drift + noise — gives a believable chart shape.
    const base = start + (end - start) * progress
    const wave = Math.sin(progress * Math.PI * 2.5) * 0.03
    const jitter = (Math.sin(i * 12.9898) * 43758.5453) % 1
    const n = (jitter - Math.floor(jitter) - 0.5) * noise
    const price = Math.max(0.02, Math.min(0.98, base + wave + n))
    out.push({
      t: now - (span - i) * HOUR * 2,  // ~8 days back, every 2h
      price: +price.toFixed(3),
    })
  }
  return out
}

export const markets: Market[] = [
  {
    id: 'm-election-2028',
    slug: 'us-president-2028',
    question: 'Who will win the 2028 US Presidential Election?',
    shortTitle: '2028 US Presidential Election',
    description:
      'This market resolves to the candidate who is declared the winner of the 2028 US Presidential Election by the Associated Press. In the event of a contested election, the market will resolve once the result is officially certified by the Electoral College.',
    category: 'Politics',
    tags: ['Election', 'USA', 'Featured'],
    outcomes: [
      { id: 'vance',   label: 'JD Vance',         price: 0.34, volume: 18_400_000, delta7d:  0.04 },
      { id: 'newsom',  label: 'Gavin Newsom',     price: 0.21, volume: 11_900_000, delta7d:  0.02 },
      { id: 'aoc',     label: 'Alexandria Ocasio-Cortez', price: 0.09, volume: 4_700_000, delta7d:  0.01 },
      { id: 'shapiro', label: 'Josh Shapiro',     price: 0.08, volume: 3_900_000, delta7d: -0.01 },
      { id: 'desantis',label: 'Ron DeSantis',     price: 0.06, volume: 2_700_000, delta7d:  0.00 },
      { id: 'other',   label: 'Someone else',     price: 0.22, volume: 9_200_000, delta7d: -0.06 },
    ],
    volume: 50_800_000,
    liquidity: 2_300_000,
    traders: 41_293,
    closeAt: '2028-11-08T05:00:00Z',
    createdAt: '2025-01-21T12:00:00Z',
    resolver: 'AP / Electoral College',
    imageColor: 'from-blue-500/30 to-red-500/30',
    imageEmoji: '🇺🇸',
    trending: true,
  },
  {
    id: 'm-btc-200k',
    slug: 'bitcoin-200k-by-2026',
    question: 'Will Bitcoin reach $200,000 by end of 2026?',
    shortTitle: 'BTC to $200k by 2026',
    description:
      'This market resolves YES if Bitcoin (BTC/USD) trades at or above $200,000 on any major exchange (Coinbase, Binance, Kraken) before 23:59 UTC on Dec 31, 2026. Resolution sources: CoinGecko 1-minute candles.',
    category: 'Crypto',
    tags: ['Bitcoin', 'BTC', 'Price target'],
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.62, volume: 14_300_000, delta7d:  0.08 },
      { id: 'no',  label: 'No',  price: 0.38, volume:  8_900_000, delta7d: -0.08 },
    ],
    volume: 23_200_000,
    liquidity: 980_000,
    traders: 18_742,
    closeAt: '2026-12-31T23:59:00Z',
    createdAt: '2025-11-14T09:00:00Z',
    resolver: 'CoinGecko',
    imageColor: 'from-amber-500/30 to-orange-500/30',
    imageEmoji: '₿',
    trending: true,
  },
  {
    id: 'm-fed-cut-jun',
    slug: 'fed-rate-cut-june-2026',
    question: 'Will the Fed cut rates at the June 2026 FOMC meeting?',
    shortTitle: 'Fed rate cut — June 2026',
    description:
      'Resolves YES if the Federal Open Market Committee announces a reduction in the federal funds target rate at its June 17, 2026 meeting.',
    category: 'Economics',
    tags: ['Fed', 'Rates', 'FOMC'],
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.47, volume:  3_600_000, delta7d: -0.05 },
      { id: 'no',  label: 'No',  price: 0.53, volume:  4_100_000, delta7d:  0.05 },
    ],
    volume: 7_700_000,
    liquidity: 410_000,
    traders: 6_421,
    closeAt: '2026-06-17T20:00:00Z',
    createdAt: '2026-01-10T10:00:00Z',
    resolver: 'Federal Reserve press release',
    imageColor: 'from-emerald-500/30 to-teal-500/30',
    imageEmoji: '🏦',
  },
  {
    id: 'm-nba-champ',
    slug: 'nba-champion-2026',
    question: 'Who will win the 2026 NBA Championship?',
    shortTitle: 'NBA Champion 2026',
    description:
      'Resolves to the team that wins the 2026 NBA Finals.',
    category: 'Sports',
    tags: ['NBA', 'Basketball', 'Championship'],
    outcomes: [
      { id: 'celtics', label: 'Boston Celtics',         price: 0.28, volume: 5_100_000, delta7d:  0.03 },
      { id: 'thunder', label: 'Oklahoma City Thunder',  price: 0.22, volume: 3_900_000, delta7d:  0.04 },
      { id: 'nuggets', label: 'Denver Nuggets',         price: 0.15, volume: 2_400_000, delta7d: -0.02 },
      { id: 'warriors',label: 'Golden State Warriors',  price: 0.10, volume: 1_600_000, delta7d: -0.01 },
      { id: 'lakers',  label: 'Los Angeles Lakers',     price: 0.08, volume: 1_200_000, delta7d:  0.00 },
      { id: 'other',   label: 'Other',                  price: 0.17, volume: 2_800_000, delta7d: -0.04 },
    ],
    volume: 17_000_000,
    liquidity: 720_000,
    traders: 14_318,
    closeAt: '2026-06-22T03:00:00Z',
    createdAt: '2025-10-22T13:00:00Z',
    resolver: 'NBA.com official result',
    imageColor: 'from-orange-500/30 to-red-500/30',
    imageEmoji: '🏀',
    trending: true,
  },
  {
    id: 'm-gpt-5-2026',
    slug: 'openai-gpt5-by-q2-2026',
    question: 'Will OpenAI release GPT-5 before July 2026?',
    shortTitle: 'GPT-5 before July 2026',
    description:
      'Resolves YES if OpenAI publicly releases a model marketed as "GPT-5" with general availability for ChatGPT Plus or API users before July 1, 2026.',
    category: 'Tech',
    tags: ['OpenAI', 'GPT-5', 'AI'],
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.71, volume: 2_300_000, delta7d:  0.06 },
      { id: 'no',  label: 'No',  price: 0.29, volume: 1_100_000, delta7d: -0.06 },
    ],
    volume: 3_400_000,
    liquidity: 220_000,
    traders: 3_117,
    closeAt: '2026-07-01T00:00:00Z',
    createdAt: '2026-02-04T16:00:00Z',
    resolver: 'OpenAI blog announcement',
    imageColor: 'from-indigo-500/30 to-purple-500/30',
    imageEmoji: '🤖',
    isNew: true,
    trending: true,
  },
  {
    id: 'm-oscars-best-pic',
    slug: 'oscars-2026-best-picture',
    question: 'Which film will win Best Picture at the 2026 Oscars?',
    shortTitle: '2026 Oscars — Best Picture',
    description:
      'Resolves to the film announced as Best Picture winner at the 98th Academy Awards ceremony.',
    category: 'Pop Culture',
    tags: ['Oscars', 'Movies', 'Awards'],
    outcomes: [
      { id: 'anora',     label: 'Anora',          price: 0.31, volume: 1_900_000, delta7d:  0.07 },
      { id: 'brutalist', label: 'The Brutalist',  price: 0.23, volume: 1_500_000, delta7d: -0.04 },
      { id: 'conclave',  label: 'Conclave',       price: 0.14, volume:   900_000, delta7d:  0.02 },
      { id: 'wicked',    label: 'Wicked',         price: 0.08, volume:   600_000, delta7d:  0.00 },
      { id: 'dune',      label: 'Dune: Part Two', price: 0.07, volume:   500_000, delta7d: -0.01 },
      { id: 'other',     label: 'Other',          price: 0.17, volume: 1_200_000, delta7d: -0.04 },
    ],
    volume: 6_600_000,
    liquidity: 310_000,
    traders: 4_982,
    closeAt: '2026-03-15T03:00:00Z',
    createdAt: '2025-12-18T10:00:00Z',
    resolver: 'Academy Awards live broadcast',
    imageColor: 'from-yellow-500/30 to-amber-600/30',
    imageEmoji: '🏆',
  },
  {
    id: 'm-spacex-mars',
    slug: 'spacex-crewed-mars-2030',
    question: 'Will SpaceX land humans on Mars before 2030?',
    shortTitle: 'SpaceX crewed Mars by 2030',
    description:
      'Resolves YES if SpaceX successfully lands a crewed mission on the surface of Mars and the astronauts survive landing before Jan 1, 2030.',
    category: 'Science',
    tags: ['SpaceX', 'Mars', 'Space'],
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.09, volume:   800_000, delta7d: -0.02 },
      { id: 'no',  label: 'No',  price: 0.91, volume: 4_300_000, delta7d:  0.02 },
    ],
    volume: 5_100_000,
    liquidity: 180_000,
    traders: 2_811,
    closeAt: '2030-01-01T00:00:00Z',
    createdAt: '2025-08-12T11:00:00Z',
    resolver: 'NASA / SpaceX official confirmation',
    imageColor: 'from-rose-500/30 to-orange-500/30',
    imageEmoji: '🚀',
  },
  {
    id: 'm-ukraine-ceasefire',
    slug: 'ukraine-ceasefire-2026',
    question: 'Will there be a verified Russia–Ukraine ceasefire by end of 2026?',
    shortTitle: 'Russia–Ukraine ceasefire 2026',
    description:
      'Resolves YES if both Russia and Ukraine sign and publicly acknowledge a ceasefire agreement, verified by a major international body (UN, OSCE), before Dec 31, 2026.',
    category: 'World',
    tags: ['Geopolitics', 'War', 'Diplomacy'],
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.41, volume: 6_700_000, delta7d:  0.09 },
      { id: 'no',  label: 'No',  price: 0.59, volume: 9_400_000, delta7d: -0.09 },
    ],
    volume: 16_100_000,
    liquidity: 540_000,
    traders: 11_204,
    closeAt: '2026-12-31T23:59:00Z',
    createdAt: '2025-09-30T08:00:00Z',
    resolver: 'UN Security Council verification',
    imageColor: 'from-blue-500/30 to-yellow-500/30',
    imageEmoji: '🕊️',
    trending: true,
  },
  {
    id: 'm-apple-ai-glasses',
    slug: 'apple-ai-glasses-2026',
    question: 'Will Apple announce AI smart glasses in 2026?',
    shortTitle: 'Apple AI glasses 2026',
    description:
      'Resolves YES if Apple Inc. officially announces a consumer smart glasses product with onboard AI features during a 2026 keynote.',
    category: 'Tech',
    tags: ['Apple', 'AR', 'AI'],
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.38, volume: 1_400_000, delta7d:  0.05 },
      { id: 'no',  label: 'No',  price: 0.62, volume: 2_100_000, delta7d: -0.05 },
    ],
    volume: 3_500_000,
    liquidity: 190_000,
    traders: 2_419,
    closeAt: '2026-12-31T23:59:00Z',
    createdAt: '2026-01-08T10:00:00Z',
    resolver: 'Apple keynote / press release',
    imageColor: 'from-slate-400/30 to-zinc-500/30',
    imageEmoji: '🕶️',
    isNew: true,
  },
  {
    id: 'm-superbowl',
    slug: 'super-bowl-lx',
    question: 'Who will win Super Bowl LX?',
    shortTitle: 'Super Bowl LX',
    description: 'Resolves to the team that wins Super Bowl LX in February 2026.',
    category: 'Sports',
    tags: ['NFL', 'Super Bowl'],
    outcomes: [
      { id: 'chiefs', label: 'Kansas City Chiefs', price: 0.24, volume: 4_200_000, delta7d:  0.02 },
      { id: 'bills',  label: 'Buffalo Bills',      price: 0.18, volume: 3_100_000, delta7d:  0.03 },
      { id: 'lions',  label: 'Detroit Lions',      price: 0.14, volume: 2_400_000, delta7d: -0.01 },
      { id: 'eagles', label: 'Philadelphia Eagles',price: 0.12, volume: 2_000_000, delta7d:  0.01 },
      { id: '49ers',  label: 'San Francisco 49ers',price: 0.10, volume: 1_700_000, delta7d:  0.00 },
      { id: 'other',  label: 'Other',              price: 0.22, volume: 3_800_000, delta7d: -0.05 },
    ],
    volume: 17_200_000,
    liquidity: 760_000,
    traders: 15_902,
    closeAt: '2026-02-08T23:30:00Z',
    createdAt: '2025-09-01T12:00:00Z',
    resolver: 'NFL official result',
    imageColor: 'from-rose-500/30 to-red-600/30',
    imageEmoji: '🏈',
  },
  {
    id: 'm-recession-2026',
    slug: 'us-recession-2026',
    question: 'Will the US enter a recession in 2026?',
    shortTitle: 'US recession 2026',
    description: 'Resolves YES if NBER declares a US recession starting in 2026.',
    category: 'Economics',
    tags: ['Recession', 'NBER', 'Macro'],
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.32, volume: 5_900_000, delta7d:  0.04 },
      { id: 'no',  label: 'No',  price: 0.68, volume: 9_800_000, delta7d: -0.04 },
    ],
    volume: 15_700_000,
    liquidity: 670_000,
    traders: 9_412,
    closeAt: '2026-12-31T23:59:00Z',
    createdAt: '2025-11-22T09:00:00Z',
    resolver: 'NBER official declaration',
    imageColor: 'from-red-500/30 to-rose-600/30',
    imageEmoji: '📉',
  },
  {
    id: 'm-taylor-swift-eu',
    slug: 'taylor-swift-eu-tour-2026',
    question: 'Will Taylor Swift announce a new tour in 2026?',
    shortTitle: 'Taylor Swift new tour 2026',
    description: 'Resolves YES if a new official Taylor Swift concert tour is announced during 2026.',
    category: 'Pop Culture',
    tags: ['Taylor Swift', 'Tour', 'Music'],
    outcomes: [
      { id: 'yes', label: 'Yes', price: 0.55, volume:   900_000, delta7d:  0.10 },
      { id: 'no',  label: 'No',  price: 0.45, volume:   700_000, delta7d: -0.10 },
    ],
    volume: 1_600_000,
    liquidity: 95_000,
    traders: 2_104,
    closeAt: '2026-12-31T23:59:00Z',
    createdAt: '2026-02-12T10:00:00Z',
    resolver: 'Official artist announcement',
    imageColor: 'from-pink-500/30 to-fuchsia-500/30',
    imageEmoji: '🎤',
    isNew: true,
  },
]

// Pre-generated history for the featured market (used on detail page).
export const histories: Record<string, { t: number; price: number }[]> = {
  'm-election-2028':     makePriceHistory(0.30, 0.34, 96, 0.05),
  'm-btc-200k':          makePriceHistory(0.54, 0.62, 96, 0.04),
  'm-fed-cut-jun':       makePriceHistory(0.52, 0.47, 96, 0.04),
  'm-nba-champ':         makePriceHistory(0.25, 0.28, 96, 0.04),
  'm-gpt-5-2026':        makePriceHistory(0.65, 0.71, 96, 0.04),
  'm-oscars-best-pic':   makePriceHistory(0.24, 0.31, 96, 0.04),
  'm-spacex-mars':       makePriceHistory(0.11, 0.09, 96, 0.03),
  'm-ukraine-ceasefire': makePriceHistory(0.32, 0.41, 96, 0.05),
  'm-apple-ai-glasses':  makePriceHistory(0.33, 0.38, 96, 0.04),
  'm-superbowl':         makePriceHistory(0.22, 0.24, 96, 0.04),
  'm-recession-2026':    makePriceHistory(0.28, 0.32, 96, 0.04),
  'm-taylor-swift-eu':   makePriceHistory(0.45, 0.55, 96, 0.05),
}

// Categories with emojis used in the top nav strip.
export const categories: { id: 'All' | Category; emoji: string; label: string }[] = [
  { id: 'All',          emoji: '🔥', label: 'Trending' },
  { id: 'Politics',     emoji: '🗳️', label: 'Politics' },
  { id: 'Crypto',       emoji: '₿',  label: 'Crypto' },
  { id: 'Sports',       emoji: '🏆', label: 'Sports' },
  { id: 'Tech',         emoji: '🤖', label: 'Tech' },
  { id: 'Economics',    emoji: '📈', label: 'Economics' },
  { id: 'Pop Culture',  emoji: '🎬', label: 'Pop Culture' },
  { id: 'Science',      emoji: '🔬', label: 'Science' },
  { id: 'World',        emoji: '🌍', label: 'World' },
]

// Recent activity / trade feed (used on home + market detail).
export type Activity = {
  id: string
  user: string
  avatar: string         // emoji used as avatar fallback
  side: 'YES' | 'NO' | string  // outcome label
  market: string         // market id
  marketTitle: string
  amount: number         // USD
  price: number          // 0..1
  timeAgo: string
}

export const activity: Activity[] = [
  { id: 'a1', user: 'whale.eth',  avatar: '🐋', side: 'YES', market: 'm-btc-200k',          marketTitle: 'BTC to $200k by 2026',          amount: 25_000, price: 0.61, timeAgo: '2m' },
  { id: 'a2', user: 'cassidy.x',  avatar: '🦊', side: 'JD Vance', market: 'm-election-2028',marketTitle: '2028 US President',              amount: 1_800,  price: 0.33, timeAgo: '4m' },
  { id: 'a3', user: 'shortking',  avatar: '🐻', side: 'NO',  market: 'm-fed-cut-jun',       marketTitle: 'Fed rate cut June 2026',         amount: 6_400,  price: 0.54, timeAgo: '7m' },
  { id: 'a4', user: 'oracle9',    avatar: '🦉', side: 'YES', market: 'm-gpt-5-2026',        marketTitle: 'GPT-5 before July 2026',         amount: 920,    price: 0.71, timeAgo: '9m' },
  { id: 'a5', user: 'lina.k',     avatar: '🐱', side: 'Celtics', market: 'm-nba-champ',     marketTitle: 'NBA Champion 2026',              amount: 3_300,  price: 0.27, timeAgo: '12m' },
  { id: 'a6', user: 'macro_dan',  avatar: '🐺', side: 'YES', market: 'm-ukraine-ceasefire', marketTitle: 'Russia–Ukraine ceasefire 2026',  amount: 12_500, price: 0.40, timeAgo: '14m' },
  { id: 'a7', user: 'pip_pip',    avatar: '🦅', side: 'NO',  market: 'm-recession-2026',    marketTitle: 'US recession 2026',              amount: 4_700,  price: 0.67, timeAgo: '18m' },
  { id: 'a8', user: 'satoshi.jr', avatar: '🤖', side: 'YES', market: 'm-btc-200k',          marketTitle: 'BTC to $200k by 2026',           amount: 8_200,  price: 0.62, timeAgo: '22m' },
]

// Leaderboard — top traders by P&L.
export type LeaderboardRow = {
  rank: number
  user: string
  avatar: string
  pnl: number          // USD net P&L
  volume: number       // USD traded
  winRate: number      // 0..1
  positions: number
  streak: number       // consecutive winning resolutions
  badge?: 'whale' | 'sharp' | 'rising'
}

export const leaderboard: LeaderboardRow[] = [
  { rank: 1,  user: 'whale.eth',     avatar: '🐋', pnl: 1_842_330, volume: 12_400_000, winRate: 0.71, positions: 312, streak: 12, badge: 'whale' },
  { rank: 2,  user: 'oracle9',       avatar: '🦉', pnl: 1_217_900, volume:  8_900_000, winRate: 0.74, positions: 198, streak:  9, badge: 'sharp' },
  { rank: 3,  user: 'macro_dan',     avatar: '🐺', pnl:   904_120, volume:  6_700_000, winRate: 0.68, positions: 244, streak:  5 },
  { rank: 4,  user: 'lina.k',        avatar: '🐱', pnl:   712_440, volume:  5_100_000, winRate: 0.70, positions: 167, streak:  7, badge: 'sharp' },
  { rank: 5,  user: 'shortking',     avatar: '🐻', pnl:   601_820, volume:  4_400_000, winRate: 0.66, positions: 189, streak:  3 },
  { rank: 6,  user: 'satoshi.jr',    avatar: '🤖', pnl:   503_290, volume:  4_000_000, winRate: 0.72, positions: 152, streak:  6 },
  { rank: 7,  user: 'pip_pip',       avatar: '🦅', pnl:   418_700, volume:  3_300_000, winRate: 0.65, positions: 134, streak:  4 },
  { rank: 8,  user: 'cassidy.x',     avatar: '🦊', pnl:   389_410, volume:  3_100_000, winRate: 0.69, positions: 121, streak:  2 },
  { rank: 9,  user: 'newkid',        avatar: '🐣', pnl:   294_650, volume:  1_900_000, winRate: 0.78, positions:  62, streak: 11, badge: 'rising' },
  { rank: 10, user: 'doomer.fi',     avatar: '👻', pnl:   261_080, volume:  2_200_000, winRate: 0.63, positions: 109, streak:  1 },
  { rank: 11, user: 'goldmaxx',      avatar: '🦄', pnl:   244_990, volume:  2_000_000, winRate: 0.66, positions:  98, streak:  3 },
  { rank: 12, user: 'sunny_d',       avatar: '🌞', pnl:   211_300, volume:  1_700_000, winRate: 0.64, positions:  88, streak:  2 },
]

// Current user portfolio.
export type Position = {
  id: string
  marketId: string
  marketTitle: string
  outcome: string       // outcome label
  side: 'YES' | 'NO' | 'OUTCOME'
  shares: number        // # of contracts
  avgPrice: number      // 0..1
  currentPrice: number  // 0..1
  category: Category
  imageEmoji: string
  imageColor: string
}

export const portfolio: { balance: number; deposited: number; positions: Position[] } = {
  balance: 12_482.55,
  deposited: 5_000,
  positions: [
    {
      id: 'p1',
      marketId: 'm-btc-200k',
      marketTitle: 'Will Bitcoin reach $200,000 by end of 2026?',
      outcome: 'Yes',
      side: 'YES',
      shares: 4_200,
      avgPrice: 0.51,
      currentPrice: 0.62,
      category: 'Crypto',
      imageEmoji: '₿',
      imageColor: 'from-amber-500/30 to-orange-500/30',
    },
    {
      id: 'p2',
      marketId: 'm-election-2028',
      marketTitle: '2028 US Presidential Election',
      outcome: 'JD Vance',
      side: 'OUTCOME',
      shares: 1_800,
      avgPrice: 0.28,
      currentPrice: 0.34,
      category: 'Politics',
      imageEmoji: '🇺🇸',
      imageColor: 'from-blue-500/30 to-red-500/30',
    },
    {
      id: 'p3',
      marketId: 'm-gpt-5-2026',
      marketTitle: 'GPT-5 before July 2026',
      outcome: 'Yes',
      side: 'YES',
      shares: 1_200,
      avgPrice: 0.62,
      currentPrice: 0.71,
      category: 'Tech',
      imageEmoji: '🤖',
      imageColor: 'from-indigo-500/30 to-purple-500/30',
    },
    {
      id: 'p4',
      marketId: 'm-recession-2026',
      marketTitle: 'US recession 2026',
      outcome: 'No',
      side: 'NO',
      shares: 950,
      avgPrice: 0.72,
      currentPrice: 0.68,
      category: 'Economics',
      imageEmoji: '📉',
      imageColor: 'from-red-500/30 to-rose-600/30',
    },
    {
      id: 'p5',
      marketId: 'm-superbowl',
      marketTitle: 'Super Bowl LX',
      outcome: 'Kansas City Chiefs',
      side: 'OUTCOME',
      shares: 600,
      avgPrice: 0.21,
      currentPrice: 0.24,
      category: 'Sports',
      imageEmoji: '🏈',
      imageColor: 'from-rose-500/30 to-red-600/30',
    },
  ],
}

// 30-day portfolio value series for the portfolio chart.
export const portfolioHistory = (() => {
  const out: { t: number; value: number }[] = []
  const days = 30
  const now = Date.now()
  let v = 8_500
  for (let i = 0; i < days; i++) {
    const drift = (i / days) * 4_000
    const jitter = (Math.sin(i * 12.9898) * 43758.5453) % 1
    const n = ((jitter - Math.floor(jitter)) - 0.5) * 600
    v = 8_500 + drift + n
    out.push({ t: now - (days - i) * 86_400_000, value: +v.toFixed(2) })
  }
  return out
})()
