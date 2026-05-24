// ============================================================================
// Predictly — Playbooks Marketplace mock data & utilities
// ============================================================================

import type {
  Category,
  Playbook,
  PlaybookCreator,
  PlaybookPost,
  PlaybookSubscription,
} from '@/types'

// ── Constants ────────────────────────────────────────────────────────────────

export const PLATFORM_CUT = 0.25

// ── Creators ─────────────────────────────────────────────────────────────────

export const MOCK_PLAYBOOK_CREATORS: PlaybookCreator[] = [
  {
    id: 'creator-whale',
    username: 'whale.eth',
    avatar: '🐋',
    badge: 'whale',
    bio: 'Institutional-grade crypto analysis. Former quant at Citadel. Deep on-chain data and macro correlations.',
    total_playbooks: 3,
    total_subscribers: 1247,
    total_earnings: 89_200,
    win_rate: 0.71,
    avg_return: 0.34,
    verified_at: '2025-06-15T00:00:00Z',
    specialties: ['Crypto', 'Economics'],
  },
  {
    id: 'creator-oracle9',
    username: 'oracle9',
    avatar: '🦉',
    badge: 'sharp',
    bio: 'Political forecaster with a 78% hit rate. Former campaign strategist. Data-driven, not partisan.',
    total_playbooks: 2,
    total_subscribers: 834,
    total_earnings: 52_100,
    win_rate: 0.74,
    avg_return: 0.28,
    verified_at: '2025-08-20T00:00:00Z',
    specialties: ['Politics', 'Tech'],
  },
  {
    id: 'creator-macro-dan',
    username: 'macro_dan',
    avatar: '🐺',
    bio: 'Macro economist tracking global risk. 15 years on Wall Street. Fed whisperer.',
    total_playbooks: 2,
    total_subscribers: 612,
    total_earnings: 41_300,
    win_rate: 0.68,
    avg_return: 0.22,
    verified_at: null,
    specialties: ['Economics', 'World'],
  },
  {
    id: 'creator-lina-k',
    username: 'lina.k',
    avatar: '🐱',
    badge: 'sharp',
    bio: 'Sports analytics & pop culture maven. Finding edges where others see entertainment.',
    total_playbooks: 1,
    total_subscribers: 423,
    total_earnings: 28_000,
    win_rate: 0.70,
    avg_return: 0.19,
    verified_at: '2025-10-01T00:00:00Z',
    specialties: ['Sports', 'Pop Culture'],
  },
  {
    id: 'creator-newkid',
    username: 'newkid',
    avatar: '🐣',
    badge: 'rising',
    bio: 'Fresh face, sharp calls. Up 78% win rate in first 6 months. Crypto native, degen at heart.',
    total_playbooks: 1,
    total_subscribers: 189,
    total_earnings: 8_400,
    win_rate: 0.78,
    avg_return: 0.41,
    verified_at: null,
    specialties: ['Crypto'],
  },
  {
    id: 'creator-shortking',
    username: 'shortking',
    avatar: '🐻',
    bio: 'Contrarian economist. Profit from panic. Specializing in downside scenarios and black swans.',
    total_playbooks: 1,
    total_subscribers: 301,
    total_earnings: 19_200,
    win_rate: 0.66,
    avg_return: 0.25,
    verified_at: null,
    specialties: ['Economics'],
  },
]

// ── Playbooks ────────────────────────────────────────────────────────────────

export const MOCK_PLAYBOOKS: Playbook[] = [
  {
    id: 'pb-crypto-alpha',
    creator_id: 'creator-whale',
    creator_username: 'whale.eth',
    creator_avatar: '🐋',
    creator_badge: 'whale',
    title: 'Crypto Alpha Weekly',
    description: 'Deep-dive analysis of crypto markets every week. On-chain data, whale tracking, and DeFi opportunities. Includes entry/exit signals with risk management.',
    cover_color: 'from-amber-500/30 to-orange-500/30',
    cover_emoji: '₿',
    category: 'Crypto',
    tier: 'premium',
    price_monthly: 29,
    subscriber_count: 423,
    max_subscribers: 500,
    rating: 4.7,
    rating_count: 312,
    total_posts: 87,
    open_positions: 5,
    win_rate: 0.74,
    avg_return: 0.34,
    status: 'active',
    tags: ['Bitcoin', 'DeFi', 'On-chain', 'Signals'],
    featured: true,
    created_at: '2025-09-01T00:00:00Z',
    last_post_at: '2026-03-10T14:00:00Z',
  },
  {
    id: 'pb-macro-moves',
    creator_id: 'creator-whale',
    creator_username: 'whale.eth',
    creator_avatar: '🐋',
    creator_badge: 'whale',
    title: 'Macro Moves Daily',
    description: 'Daily macro analysis connecting Fed policy, global events, and market impact. Institutional-grade research for prediction market traders.',
    cover_color: 'from-emerald-500/30 to-teal-500/30',
    cover_emoji: '🏦',
    category: 'Economics',
    tier: 'elite',
    price_monthly: 49,
    subscriber_count: 198,
    max_subscribers: 250,
    rating: 4.8,
    rating_count: 156,
    total_posts: 142,
    open_positions: 3,
    win_rate: 0.71,
    avg_return: 0.28,
    status: 'active',
    tags: ['Fed', 'Macro', 'Daily', 'Institutional'],
    featured: true,
    created_at: '2025-10-15T00:00:00Z',
    last_post_at: '2026-03-10T09:00:00Z',
  },
  {
    id: 'pb-political-odds',
    creator_id: 'creator-oracle9',
    creator_username: 'oracle9',
    creator_avatar: '🦉',
    creator_badge: 'sharp',
    title: 'Political Odds Insider',
    description: 'Data-driven political forecasting with historical precedent analysis. Polls, fundamentals, and insider sentiment — no spin, just odds.',
    cover_color: 'from-blue-500/30 to-red-500/30',
    cover_emoji: '🗳️',
    category: 'Politics',
    tier: 'basic',
    price_monthly: 19,
    subscriber_count: 567,
    max_subscribers: null,
    rating: 4.5,
    rating_count: 489,
    total_posts: 63,
    open_positions: 4,
    win_rate: 0.78,
    avg_return: 0.26,
    status: 'active',
    tags: ['Elections', 'Polls', 'Data-driven', 'Forecasting'],
    featured: true,
    created_at: '2025-07-20T00:00:00Z',
    last_post_at: '2026-03-09T18:00:00Z',
  },
  {
    id: 'pb-tech-disruption',
    creator_id: 'creator-oracle9',
    creator_username: 'oracle9',
    creator_avatar: '🦉',
    creator_badge: 'sharp',
    title: 'Tech Disruption Tracker',
    description: 'Tracking the biggest bets in tech — AI milestones, product launches, and regulatory shifts. When technology meets prediction markets.',
    cover_color: 'from-violet-500/30 to-purple-500/30',
    cover_emoji: '🤖',
    category: 'Tech',
    tier: 'premium',
    price_monthly: 39,
    subscriber_count: 267,
    max_subscribers: 400,
    rating: 4.6,
    rating_count: 201,
    total_posts: 51,
    open_positions: 6,
    win_rate: 0.72,
    avg_return: 0.31,
    status: 'active',
    tags: ['AI', 'Product Launches', 'Regulation', 'Big Tech'],
    featured: false,
    created_at: '2025-11-01T00:00:00Z',
    last_post_at: '2026-03-08T12:00:00Z',
  },
  {
    id: 'pb-global-risk',
    creator_id: 'creator-macro-dan',
    creator_username: 'macro_dan',
    creator_avatar: '🐺',
    title: 'Global Risk Monitor',
    description: 'Geopolitical risk assessment and macro trend analysis. War, diplomacy, trade — how global events shape prediction market odds.',
    cover_color: 'from-blue-500/30 to-yellow-500/30',
    cover_emoji: '🌍',
    category: 'World',
    tier: 'basic',
    price_monthly: 24,
    subscriber_count: 312,
    max_subscribers: null,
    rating: 4.3,
    rating_count: 278,
    total_posts: 95,
    open_positions: 4,
    win_rate: 0.68,
    avg_return: 0.22,
    status: 'active',
    tags: ['Geopolitics', 'War', 'Trade', 'Macro'],
    featured: false,
    created_at: '2025-08-10T00:00:00Z',
    last_post_at: '2026-03-10T07:00:00Z',
  },
  {
    id: 'pb-fed-watch',
    creator_id: 'creator-macro-dan',
    creator_username: 'macro_dan',
    creator_avatar: '🐺',
    title: 'Fed Watch Pro',
    description: 'Every FOMC meeting, every dot plot, every speech — decoded. Real-time analysis of Fed policy and its market implications.',
    cover_color: 'from-emerald-500/30 to-green-500/30',
    cover_emoji: '📈',
    category: 'Economics',
    tier: 'basic',
    price_monthly: 15,
    subscriber_count: 300,
    max_subscribers: null,
    rating: 4.1,
    rating_count: 245,
    total_posts: 78,
    open_positions: 2,
    win_rate: 0.66,
    avg_return: 0.18,
    status: 'active',
    tags: ['Fed', 'FOMC', 'Rates', 'Monetary Policy'],
    featured: false,
    created_at: '2025-09-05T00:00:00Z',
    last_post_at: '2026-03-09T16:00:00Z',
  },
  {
    id: 'pb-sports-edge',
    creator_id: 'creator-lina-k',
    creator_username: 'lina.k',
    creator_avatar: '🐱',
    creator_badge: 'sharp',
    title: 'Sports Edge',
    description: 'Analytics-driven sports predictions. NFL, NBA, and more — where data meets the game. Free tier with weekly picks.',
    cover_color: 'from-orange-500/30 to-red-500/30',
    cover_emoji: '🏀',
    category: 'Sports',
    tier: 'free',
    price_monthly: 0,
    subscriber_count: 423,
    max_subscribers: null,
    rating: 4.2,
    rating_count: 312,
    total_posts: 56,
    open_positions: 3,
    win_rate: 0.70,
    avg_return: 0.19,
    status: 'active',
    tags: ['NFL', 'NBA', 'Analytics', 'Free'],
    featured: false,
    created_at: '2025-12-01T00:00:00Z',
    last_post_at: '2026-03-10T11:00:00Z',
  },
  {
    id: 'pb-diamond-hands',
    creator_id: 'creator-newkid',
    creator_username: 'newkid',
    creator_avatar: '🐣',
    creator_badge: 'rising',
    title: 'Diamond Hands Daily',
    description: 'Fresh perspective on crypto from Gen Z. High-conviction calls with transparent tracking. Free while I build my track record.',
    cover_color: 'from-cyan-500/30 to-blue-500/30',
    cover_emoji: '💎',
    category: 'Crypto',
    tier: 'free',
    price_monthly: 0,
    subscriber_count: 189,
    max_subscribers: null,
    rating: 4.4,
    rating_count: 134,
    total_posts: 42,
    open_positions: 7,
    win_rate: 0.78,
    avg_return: 0.41,
    status: 'active',
    tags: ['Crypto', 'Altcoins', 'High-conviction', 'Free'],
    featured: true,
    created_at: '2026-01-15T00:00:00Z',
    last_post_at: '2026-03-10T15:00:00Z',
  },
  {
    id: 'pb-bear-market',
    creator_id: 'creator-shortking',
    creator_username: 'shortking',
    creator_avatar: '🐻',
    title: 'Bear Market Bets',
    description: 'Contrarian plays and downside scenarios. When everyone is bullish, I find the cracks. Specializing in recession bets and short setups.',
    cover_color: 'from-red-500/30 to-rose-600/30',
    cover_emoji: '📉',
    category: 'Economics',
    tier: 'basic',
    price_monthly: 19,
    subscriber_count: 301,
    max_subscribers: null,
    rating: 4.0,
    rating_count: 198,
    total_posts: 68,
    open_positions: 4,
    win_rate: 0.66,
    avg_return: 0.25,
    status: 'active',
    tags: ['Contrarian', 'Recession', 'Short', 'Bear'],
    featured: false,
    created_at: '2025-10-01T00:00:00Z',
    last_post_at: '2026-03-08T14:00:00Z',
  },
  {
    id: 'pb-earnings-whisper',
    creator_id: 'creator-whale',
    creator_username: 'whale.eth',
    creator_avatar: '🐋',
    creator_badge: 'whale',
    title: 'Earnings Whisper',
    description: 'Quarterly earnings predictions with deep fundamental analysis. Corporate earnings, guidance signals, and market reaction forecasts.',
    cover_color: 'from-yellow-500/30 to-amber-600/30',
    cover_emoji: '📊',
    category: 'Stocks',
    tier: 'premium',
    price_monthly: 35,
    subscriber_count: 145,
    max_subscribers: 200,
    rating: 4.5,
    rating_count: 98,
    total_posts: 34,
    open_positions: 3,
    win_rate: 0.73,
    avg_return: 0.29,
    status: 'active',
    tags: ['Earnings', 'Stocks', 'Fundamentals', 'Guidance'],
    featured: false,
    created_at: '2026-01-20T00:00:00Z',
    last_post_at: '2026-03-07T10:00:00Z',
  },
]

// ── Posts ────────────────────────────────────────────────────────────────────

export const MOCK_PLAYBOOK_POSTS: PlaybookPost[] = [
  {
    id: 'post-1',
    playbook_id: 'pb-crypto-alpha',
    title: 'BTC Rally Continues — Adding to YES Position',
    content: 'Bitcoin has broken through the $185K resistance with strong volume. On-chain metrics show whale accumulation accelerating over the past 72 hours. The MVRV ratio is at 2.1, still below the historical sell-zone of 3.5. I\'m adding 2,000 shares of YES on BTC to $200K at current price of 62¢. Risk-reward favors upside with a stop at 50¢.',
    market_ids: ['m-btc-200k'],
    position_type: 'new_entry',
    outcomes_shared: [
      { market_id: 'm-btc-200k', side: 'YES', shares: 2000, entry_price: 0.62, current_price: 0.62, pnl: 0 },
    ],
    is_free_preview: true,
    likes: 87,
    comments_count: 23,
    created_at: '2026-03-10T14:00:00Z',
  },
  {
    id: 'post-2',
    playbook_id: 'pb-crypto-alpha',
    title: 'DeFi TVL Analysis — What the Data Says',
    content: 'Total DeFi TVL has reached $280B, up 45% from Q4 2025. The growth is driven primarily by L2 protocols and restaking. Key insight: the correlation between TVL growth and BTC price targets is 0.82 over the past 12 months. This strengthens the bullish case for BTC $200K by year end.',
    market_ids: ['m-btc-200k'],
    position_type: 'analysis',
    outcomes_shared: [],
    is_free_preview: true,
    likes: 64,
    comments_count: 15,
    created_at: '2026-03-08T10:00:00Z',
  },
  {
    id: 'post-3',
    playbook_id: 'pb-crypto-alpha',
    title: 'Altcoin Season Signal — Rotating Profits',
    content: 'The altcoin season indicator has crossed 75%, historically a sign that BTC dominance will decrease. I\'m taking partial profits on BTC positions and allocating to high-beta DeFi tokens. Current BTC YES position still open with +18% unrealized P&L.',
    market_ids: ['m-btc-200k'],
    position_type: 'hold',
    outcomes_shared: [
      { market_id: 'm-btc-200k', side: 'YES', shares: 1200, entry_price: 0.55, current_price: 0.65, pnl: 120 },
    ],
    is_free_preview: false,
    likes: 52,
    comments_count: 19,
    created_at: '2026-03-06T16:00:00Z',
  },
  {
    id: 'post-4',
    playbook_id: 'pb-macro-moves',
    title: 'Fed Minutes Deep Dive — Rate Cut Odds Rising',
    content: 'The March FOMC minutes reveal growing concern about labor market softening. Two additional dissenters joined the cut camp. My model now puts June rate cut probability at 52%, above the market\'s 47%. Going YES on the June cut at 47¢ — this is a value play.',
    market_ids: ['m-fed-cut-jun'],
    position_type: 'new_entry',
    outcomes_shared: [
      { market_id: 'm-fed-cut-jun', side: 'YES', shares: 1500, entry_price: 0.47, current_price: 0.47, pnl: 0 },
    ],
    is_free_preview: true,
    likes: 112,
    comments_count: 34,
    created_at: '2026-03-10T09:00:00Z',
  },
  {
    id: 'post-5',
    playbook_id: 'pb-macro-moves',
    title: 'Recession Dashboard — Mixed Signals',
    content: 'The yield curve has un-inverted, but leading economic indicators are still negative. Historical data shows this pattern often precedes recession within 6-12 months. I\'m maintaining my YES position on US recession 2026 at 32¢ — asymmetric risk-reward.',
    market_ids: ['m-recession-2026'],
    position_type: 'hold',
    outcomes_shared: [
      { market_id: 'm-recession-2026', side: 'YES', shares: 800, entry_price: 0.28, current_price: 0.32, pnl: 32 },
    ],
    is_free_preview: false,
    likes: 78,
    comments_count: 28,
    created_at: '2026-03-09T07:00:00Z',
  },
  {
    id: 'post-6',
    playbook_id: 'pb-political-odds',
    title: '2028 Election — Early Read on the Field',
    content: 'JD Vance leads at 34¢ but his approval ratings have plateaued. Newsom at 21¢ is undervalued given California\'s fundraising machine. The "Someone else" bucket at 22¢ is interesting — dark horse candidates have historically outperformed expectations. I\'m buying Newsom and "Other" as a hedge pair.',
    market_ids: ['m-election-2028'],
    position_type: 'new_entry',
    outcomes_shared: [
      { market_id: 'm-election-2028', side: 'YES', shares: 500, entry_price: 0.21, current_price: 0.21, pnl: 0 },
    ],
    is_free_preview: true,
    likes: 145,
    comments_count: 42,
    created_at: '2026-03-09T18:00:00Z',
  },
  {
    id: 'post-7',
    playbook_id: 'pb-political-odds',
    title: 'Ukraine Ceasefire — Diplomatic Momentum Building',
    content: 'Three new diplomatic channels have opened in the past week. My sources indicate back-channel talks are more advanced than public reporting suggests. The market at 41¢ YES undervalues the probability of a ceasefire framework by year-end. Adding to my YES position.',
    market_ids: ['m-ukraine-ceasefire'],
    position_type: 'new_entry',
    outcomes_shared: [
      { market_id: 'm-ukraine-ceasefire', side: 'YES', shares: 1000, entry_price: 0.41, current_price: 0.41, pnl: 0 },
    ],
    is_free_preview: false,
    likes: 93,
    comments_count: 31,
    created_at: '2026-03-08T15:00:00Z',
  },
  {
    id: 'post-8',
    playbook_id: 'pb-tech-disruption',
    title: 'GPT-5 Launch Window — New Evidence',
    content: 'OpenAI\'s hiring pattern and compute allocation suggest a Q2 2026 release is increasingly likely. The market at 71¢ YES still has room to run — I project 85%+ probability once the announcement timeline becomes clear. My position from 65¢ is up +9%.',
    market_ids: ['m-gpt-5-2026'],
    position_type: 'hold',
    outcomes_shared: [
      { market_id: 'm-gpt-5-2026', side: 'YES', shares: 800, entry_price: 0.65, current_price: 0.71, pnl: 48 },
    ],
    is_free_preview: true,
    likes: 89,
    comments_count: 27,
    created_at: '2026-03-08T12:00:00Z',
  },
  {
    id: 'post-9',
    playbook_id: 'pb-tech-disruption',
    title: 'Apple AI Glasses — Supply Chain Signals',
    content: 'Foxconn has ramped up production of custom optical components consistent with AR glasses. Combined with Apple\'s recent hire of 3 AR/VR engineers from Meta, I see 38¢ YES as undervalued. This is a 2026 announcement, not a release — much lower bar.',
    market_ids: ['m-apple-ai-glasses'],
    position_type: 'new_entry',
    outcomes_shared: [
      { market_id: 'm-apple-ai-glasses', side: 'YES', shares: 600, entry_price: 0.38, current_price: 0.38, pnl: 0 },
    ],
    is_free_preview: false,
    likes: 67,
    comments_count: 22,
    created_at: '2026-03-07T14:00:00Z',
  },
  {
    id: 'post-10',
    playbook_id: 'pb-global-risk',
    title: 'Global Conflict Tracker — Ceasefire Probability Rising',
    content: 'Diplomatic activity has intensified on three fronts. The UN Security Council scheduling a special session is a bullish signal. I\'m upgrading my ceasefire probability to 48% from 41% — market is still lagging the fundamentals.',
    market_ids: ['m-ukraine-ceasefire', 'm-recession-2026'],
    position_type: 'analysis',
    outcomes_shared: [
      { market_id: 'm-ukraine-ceasefire', side: 'YES', shares: 1200, entry_price: 0.35, current_price: 0.41, pnl: 72 },
    ],
    is_free_preview: true,
    likes: 54,
    comments_count: 18,
    created_at: '2026-03-10T07:00:00Z',
  },
  {
    id: 'post-11',
    playbook_id: 'pb-fed-watch',
    title: 'Fed Speakers This Week — What to Watch',
    content: 'Powell speaks Wednesday, followed by Waller on Thursday. My model assigns 60% probability to dovish commentary based on recent data. If Powell signals patience, the June cut market could dip — that\'s a buying opportunity for YES holders.',
    market_ids: ['m-fed-cut-jun'],
    position_type: 'analysis',
    outcomes_shared: [],
    is_free_preview: true,
    likes: 43,
    comments_count: 14,
    created_at: '2026-03-09T16:00:00Z',
  },
  {
    id: 'post-12',
    playbook_id: 'pb-sports-edge',
    title: 'NBA Championship — Celtics Value at 28¢',
    content: 'The Celtics have the best net rating in the league since the All-Star break. Their playoff rotation is settling in and Porzingis looks healthy. At 28¢, I like them as the best value in the field. Thunder at 22¢ is the main threat.',
    market_ids: ['m-nba-champ'],
    position_type: 'new_entry',
    outcomes_shared: [
      { market_id: 'm-nba-champ', side: 'YES', shares: 400, entry_price: 0.28, current_price: 0.28, pnl: 0 },
    ],
    is_free_preview: true,
    likes: 98,
    comments_count: 36,
    created_at: '2026-03-10T11:00:00Z',
  },
  {
    id: 'post-13',
    playbook_id: 'pb-diamond-hands',
    title: 'BTC On-Fire — My Biggest Call Yet',
    content: 'Alright degens, here\'s my highest-conviction trade: BTC hits $200K before 2027. The halving cycle, ETF inflows, and institutional adoption are all aligned. I\'m all-in on YES at 62¢. If I\'m right, that\'s a 61% return. Not financial advice, just diamond hands. 🙌',
    market_ids: ['m-btc-200k'],
    position_type: 'new_entry',
    outcomes_shared: [
      { market_id: 'm-btc-200k', side: 'YES', shares: 3000, entry_price: 0.62, current_price: 0.62, pnl: 0 },
    ],
    is_free_preview: true,
    likes: 156,
    comments_count: 48,
    created_at: '2026-03-10T15:00:00Z',
  },
  {
    id: 'post-14',
    playbook_id: 'pb-bear-market',
    title: 'Recession Risk — The Data No One Is Watching',
    content: 'Commercial real estate defaults are accelerating. Regional banks are quietly building loan loss reserves. The NBER might not call it yet, but the underlying data is deteriorating. I\'m adding YES on recession at 32¢ — if they declare, this pays 3:1.',
    market_ids: ['m-recession-2026', 'm-fed-cut-jun'],
    position_type: 'new_entry',
    outcomes_shared: [
      { market_id: 'm-recession-2026', side: 'YES', shares: 600, entry_price: 0.32, current_price: 0.32, pnl: 0 },
    ],
    is_free_preview: true,
    likes: 71,
    comments_count: 25,
    created_at: '2026-03-08T14:00:00Z',
  },
  {
    id: 'post-15',
    playbook_id: 'pb-earnings-whisper',
    title: 'Q1 Earnings Season Preview — Key Markets to Watch',
    content: 'Earnings season kicks off next week with the big banks. Historically, strong bank earnings correlate with lower recession probabilities. I\'m watching the guidance language carefully — "cautious optimism" has been the recurring theme. This impacts both the recession and Fed rate cut markets.',
    market_ids: ['m-recession-2026', 'm-fed-cut-jun'],
    position_type: 'analysis',
    outcomes_shared: [],
    is_free_preview: false,
    likes: 45,
    comments_count: 12,
    created_at: '2026-03-07T10:00:00Z',
  },
]

// ── Mock Subscriptions ───────────────────────────────────────────────────────

export const MOCK_PLAYBOOK_SUBSCRIPTIONS: PlaybookSubscription[] = [
  {
    id: 'sub-1',
    user_id: 'u1',
    playbook_id: 'pb-crypto-alpha',
    status: 'active',
    price_at_subscribe: 29,
    current_price: 29,
    started_at: '2026-01-15T00:00:00Z',
    expires_at: '2026-04-15T00:00:00Z',
    auto_renew: true,
  },
  {
    id: 'sub-2',
    user_id: 'u1',
    playbook_id: 'pb-sports-edge',
    status: 'active',
    price_at_subscribe: 0,
    current_price: 0,
    started_at: '2026-02-01T00:00:00Z',
    expires_at: '2099-12-31T00:00:00Z',
    auto_renew: true,
  },
]

// ── Utility Functions ────────────────────────────────────────────────────────

export function calculateCreatorEarnings(playbook: Playbook): number {
  const grossMonthly = playbook.price_monthly * playbook.subscriber_count
  return grossMonthly * (1 - PLATFORM_CUT)
}

export function getPlaybookRatingStars(rating: number): string {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.3
  let stars = '★'.repeat(fullStars)
  if (hasHalf) stars += '½'
  const empty = 5 - fullStars - (hasHalf ? 1 : 0)
  stars += '☆'.repeat(empty)
  return stars
}

export function getTierBadgeColor(tier: PlaybookTier): string {
  switch (tier) {
    case 'free': return 'bg-fg-subtle/20 text-fg-muted'
    case 'basic': return 'bg-yes-soft text-yes'
    case 'premium': return 'bg-brand-soft text-brand'
    case 'elite': return 'bg-gold-soft text-gold'
  }
}

export function getTierLabel(tier: PlaybookTier): string {
  switch (tier) {
    case 'free': return 'Free'
    case 'basic': return 'Basic'
    case 'premium': return 'Premium'
    case 'elite': return 'Elite'
  }
}

export function getBadgeColor(badge: 'whale' | 'sharp' | 'rising' | 'verified'): string {
  switch (badge) {
    case 'whale': return 'bg-blue-500/20 text-blue-400'
    case 'sharp': return 'bg-emerald-500/20 text-emerald-400'
    case 'rising': return 'bg-amber-500/20 text-amber-400'
    case 'verified': return 'bg-purple-500/20 text-purple-400'
  }
}

export function getBadgeIcon(badge: 'whale' | 'sharp' | 'rising' | 'verified'): string {
  switch (badge) {
    case 'whale': return '🐋'
    case 'sharp': return '🎯'
    case 'rising': return '🚀'
    case 'verified': return '✓'
  }
}

export function getPositionTypeColor(type: PlaybookPost['position_type']): string {
  switch (type) {
    case 'new_entry': return 'bg-yes-soft text-yes'
    case 'exit': return 'bg-no-soft text-no'
    case 'hold': return 'bg-brand-soft text-brand'
    case 'analysis': return 'bg-gold-soft text-gold'
  }
}

export function getPositionTypeLabel(type: PlaybookPost['position_type']): string {
  switch (type) {
    case 'new_entry': return 'New Entry'
    case 'exit': return 'Exit'
    case 'hold': return 'Hold'
    case 'analysis': return 'Analysis'
  }
}

export function filterPlaybooks(
  playbooks: Playbook[],
  opts: {
    category?: Category | 'All'
    tier?: PlaybookTier | 'all'
    search?: string
    sort?: 'popular' | 'newest' | 'rating' | 'return'
    creatorId?: string
  }
): Playbook[] {
  let filtered = [...playbooks]

  if (opts.category && opts.category !== 'All') {
    filtered = filtered.filter(p => p.category === opts.category)
  }

  if (opts.tier && opts.tier !== 'all') {
    filtered = filtered.filter(p => p.tier === opts.tier)
  }

  if (opts.search) {
    const q = opts.search.toLowerCase()
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.creator_username.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  if (opts.creatorId) {
    filtered = filtered.filter(p => p.creator_id === opts.creatorId)
  }

  switch (opts.sort) {
    case 'popular':
      filtered.sort((a, b) => b.subscriber_count - a.subscriber_count)
      break
    case 'newest':
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    case 'return':
      filtered.sort((a, b) => b.avg_return - a.avg_return)
      break
    default:
      filtered.sort((a, b) => b.subscriber_count - a.subscriber_count)
  }

  return filtered
}
