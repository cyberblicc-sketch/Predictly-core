import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surface palette — deeper, richer than typical slate for that
        // Polymarket "obsidian" feel.
        bg: {
          DEFAULT: '#0A0B0F',
          subtle: '#11131A',
          elevated: '#171923',
          hover: '#1E2230',
        },
        border: {
          DEFAULT: '#1F2330',
          strong: '#2A3040',
        },
        fg: {
          DEFAULT: '#F5F7FA',
          muted: '#9098A8',
          subtle: '#5A6378',
        },
        // Action colors — YES = vivid green, NO = warm red,
        // brand = electric indigo (between Polymarket blue & Kalshi green).
        yes: {
          DEFAULT: '#00D284',
          soft: 'rgba(0, 210, 132, 0.12)',
          border: 'rgba(0, 210, 132, 0.3)',
        },
        no: {
          DEFAULT: '#FF4D6D',
          soft: 'rgba(255, 77, 109, 0.12)',
          border: 'rgba(255, 77, 109, 0.3)',
        },
        brand: {
          DEFAULT: '#6366F1',
          hover: '#7C7FF3',
          soft: 'rgba(99, 102, 241, 0.12)',
        },
        warn: '#FBBF24',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'card': '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.5)',
        'glow-yes': '0 0 0 1px rgba(0,210,132,0.4), 0 8px 24px -8px rgba(0,210,132,0.4)',
        'glow-no': '0 0 0 1px rgba(255,77,109,0.4), 0 8px 24px -8px rgba(255,77,109,0.4)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
    },
  },
  plugins: [],
}
export default config
