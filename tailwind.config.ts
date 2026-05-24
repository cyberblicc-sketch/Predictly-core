import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui system
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // Predictly premium dark theme
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
        // Supreme Fusion dual-currency
        gold: {
          DEFAULT: '#FBBF24',
          soft: 'rgba(251, 191, 36, 0.12)',
          border: 'rgba(251, 191, 36, 0.3)',
        },
        sweeps: {
          DEFAULT: '#8B5CF6',
          soft: 'rgba(139, 92, 246, 0.12)',
          border: 'rgba(139, 92, 246, 0.3)',
        },
        profit: '#22C55E',
        loss: '#EF4444',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.5)',
        'glow-yes': '0 0 0 1px rgba(0,210,132,0.4), 0 8px 24px -8px rgba(0,210,132,0.4)',
        'glow-no': '0 0 0 1px rgba(255,77,109,0.4), 0 8px 24px -8px rgba(255,77,109,0.4)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
