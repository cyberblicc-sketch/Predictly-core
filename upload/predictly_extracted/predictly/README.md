# Predictly — Prediction Market UI

A modern, production-quality prediction market interface inspired by
[Polymarket](https://polymarket.com) and [Kalshi](https://kalshi.com).

> Demo UI only. All data is mocked — no real money, no backend.

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** with a custom dark theme palette
- **Recharts** for probability and portfolio charts
- **lucide-react** for icons

## Pages

| Route                 | What it is                                               |
| --------------------- | -------------------------------------------------------- |
| `/`                   | Homepage — hero, featured market, category filter, grid  |
| `/markets/[id]`       | Market detail — chart, orderbook, activity, trade panel  |
| `/portfolio`          | User portfolio — value chart, P&L summary, positions     |
| `/leaderboard`        | Top traders — podium + ranked table                      |
| `/profile`            | User profile — stats, referral, settings tabs            |

## Design choices

- **Hybrid dark theme** — Polymarket's obsidian surfaces and electric blue
  accents combined with Kalshi's clean editorial typography and a vivid
  YES/NO green/red palette.
- **Binary vs categorical markets** — the same `MarketCard` renders a
  big probability + sparkline + YES/NO buttons for binary markets, and a
  ranked list with progress bars for multi-outcome markets (like an
  election).
- **Sticky trade panel** — the right-rail buy/sell form is sticky on the
  market detail page, mimicking the always-available trade flow of both
  reference platforms.
- **Live activity feed** — emoji avatars, "x ago" timestamps, and a
  pulsing dot make the page feel alive without any websockets.
- **Mock data lives in one file** — `lib/mockData.ts` — so you can swap
  any of it for a real API later.

## Running

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Project layout

```
app/
  layout.tsx               # Root layout + Header + Footer
  page.tsx                 # Home / markets browser
  markets/[id]/page.tsx    # Market detail
  portfolio/page.tsx
  leaderboard/page.tsx
  profile/page.tsx
  globals.css

components/
  layout/   Header.tsx, Footer.tsx, CategoryStrip.tsx
  market/   MarketCard.tsx, ProbabilityChart.tsx, OrderBook.tsx, Sparkline.tsx, ActivityFeed.tsx
  trade/    TradePanel.tsx

lib/
  mockData.ts   markets, histories, activity, leaderboard, portfolio
  utils.ts      formatters: USD, percentages, dates
```

## Customizing

- **Colors** live in `tailwind.config.ts` under `theme.extend.colors`.
- **Markets / activity / leaderboard data** live in `lib/mockData.ts`.
- **Brand mark** is the gradient "P" in `components/layout/Header.tsx`.

Happy trading 📈
