'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalClose
} from '@/components/ui/Modal'
import {
  Settings as SettingsIcon,
  Shield,
  Zap,
  Bell,
  Globe,
  Database,
  Key,
  Save,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface SiteConfig {
  key: string
  value: string
  description: string
  category: string
}

interface AISwarmConfig {
  is_enabled: boolean
  max_trades_per_tick: number
  max_daily_loss: number
  agent_budgets: {
    momentum: number
    contrarian: number
    arbitrage: number
    sentiment: number
  }
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SiteConfig[]>([])
  const [aiConfig, setAiConfig] = useState<AISwarmConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // New market defaults
  const [defaultHouseFee, setDefaultHouseFee] = useState('2')
  const [defaultPlatformFee, setDefaultPlatformFee] = useState('1')
  const [defaultInitialLiquidity, setDefaultInitialLiquidity] = useState('10000')
  const [minRedeemSc, setMinRedeemSc] = useState('50')
  const [regularRedeemSc, setRegularRedeemSc] = useState('60')

  // AI Swarm settings
  const [aiEnabled, setAiEnabled] = useState(false)
  const [maxTradesPerTick, setMaxTradesPerTick] = useState('10')
  const [maxDailyLoss, setMaxDailyLoss] = useState('50000')
  const [momentumBudget, setMomentumBudget] = useState('1000')
  const [contrarianBudget, setContrarianBudget] = useState('1000')
  const [arbitrageBudget, setArbitrageBudget] = useState('1000')
  const [sentimentBudget, setSentimentBudget] = useState('1000')

  useEffect(() => { fetchConfig() }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const [configRes, aiRes] = await Promise.all([
        fetch('/api/admin/system-status'),
        fetch('/api/admin/ai-config'),
      ])

      if (configRes.ok) {
        const data = await configRes.json()
        const cfg = data.config || {}
        setDefaultHouseFee(cfg.default_house_fee || '2')
        setDefaultPlatformFee(cfg.default_platform_fee || '1')
        setDefaultInitialLiquidity(cfg.default_initial_liquidity || '10000')
        setMinRedeemSc(cfg.min_redeem_sc || '50')
        setRegularRedeemSc(cfg.regular_redeem_sc || '60')
      }

      if (aiRes.ok) {
        const aiData = await aiRes.json()
        setAiConfig(aiData)
        setAiEnabled(aiData.enabled || false)
        setMaxTradesPerTick(String(aiData.max_trades_per_tick || 10))
        setMaxDailyLoss(String(aiData.max_daily_loss || 50000))
        if (aiData.agent_budgets) {
          setMomentumBudget(String(aiData.agent_budgets.momentum || 1000))
          setContrarianBudget(String(aiData.agent_budgets.contrarian || 1000))
          setArbitrageBudget(String(aiData.agent_budgets.arbitrage || 1000))
          setSentimentBudget(String(aiData.agent_budgets.sentiment || 1000))
        }
      }
    } catch (error) { console.error('Failed to fetch config:', error) }
    finally { setLoading(false) }
  }

  const handleSaveFees = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          default_house_fee: parseFloat(defaultHouseFee),
          default_platform_fee: parseFloat(defaultPlatformFee),
          default_initial_liquidity: parseInt(defaultInitialLiquidity),
          min_redeem_sc: parseInt(minRedeemSc),
          regular_redeem_sc: parseInt(regularRedeemSc),
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Fee settings saved successfully' })
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    }
    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSaveAiConfig = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_enabled: aiEnabled,
          max_trades_per_tick: parseInt(maxTradesPerTick),
          max_daily_loss: parseInt(maxDailyLoss),
          agent_budgets: {
            momentum: parseInt(momentumBudget),
            contrarian: parseInt(contrarianBudget),
            arbitrage: parseInt(arbitrageBudget),
            sentiment: parseInt(sentimentBudget),
          },
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'AI Swarm settings saved successfully' })
      } else {
        setMessage({ type: 'error', text: 'Failed to save AI settings' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save AI settings' })
    }
    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleToggleAi = async () => {
    try {
      const res = await fetch('/api/admin/ai-config/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !aiEnabled }),
      })

      if (res.ok) {
        setAiEnabled(!aiEnabled)
        setMessage({
          type: 'success',
          text: `AI Swarm ${!aiEnabled ? 'enabled' : 'disabled'} successfully`,
        })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to toggle AI Swarm' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <svg className="animate-spin h-5 w-5 text-amber-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="text-[10px] font-mono text-amber-400/70 tracking-[0.25em] uppercase mb-2">Admin Panel</div>
        <h1 className="text-3xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure platform behavior and AI Swarm</p>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* AI Swarm Control */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">AI Swarm Control</h2>
              <p className="text-xs text-slate-400">Enable or disable autonomous trading agents</p>
            </div>
          </div>
          <button
            onClick={handleToggleAi}
            className={`relative w-14 h-7 rounded-full transition-colors ${aiEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${aiEnabled ? 'translate-x-7' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-300">Rate Limits</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Max Trades per Tick</label>
                <Input
                  type="number"
                  value={maxTradesPerTick}
                  onChange={(e) => setMaxTradesPerTick(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Max Daily Loss (SC)</label>
                <Input
                  type="number"
                  value={maxDailyLoss}
                  onChange={(e) => setMaxDailyLoss(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-300">Agent Budgets (SC per tick)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Momentum</label>
                <Input
                  type="number"
                  value={momentumBudget}
                  onChange={(e) => setMomentumBudget(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Contrarian</label>
                <Input
                  type="number"
                  value={contrarianBudget}
                  onChange={(e) => setContrarianBudget(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Arbitrage</label>
                <Input
                  type="number"
                  value={arbitrageBudget}
                  onChange={(e) => setArbitrageBudget(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Sentiment</label>
                <Input
                  type="number"
                  value={sentimentBudget}
                  onChange={(e) => setSentimentBudget(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveAiConfig} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save AI Settings'}
          </Button>
        </div>
      </Card>

      {/* Market Defaults */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Market Defaults</h2>
            <p className="text-xs text-slate-400">Default values for new markets</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">House Fee (%)</label>
            <Input
              type="number"
              step="0.1"
              value={defaultHouseFee}
              onChange={(e) => setDefaultHouseFee(e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Platform Fee (%)</label>
            <Input
              type="number"
              step="0.1"
              value={defaultPlatformFee}
              onChange={(e) => setDefaultPlatformFee(e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Initial Liquidity (SC)</label>
            <Input
              type="number"
              value={defaultInitialLiquidity}
              onChange={(e) => setDefaultInitialLiquidity(e.target.value)}
              className="bg-slate-800 border-slate-700"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveFees} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Fee Settings'}
          </Button>
        </div>
      </Card>

      {/* Redemption Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Key className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Redemption Settings</h2>
            <p className="text-xs text-slate-400">Minimum amounts for SC redemption</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Minimum Redeem (Gift Cards)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={minRedeemSc}
                onChange={(e) => setMinRedeemSc(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
              <span className="text-slate-400 self-center">SC</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">For gift card redemptions</p>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Regular Redemption Minimum</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={regularRedeemSc}
                onChange={(e) => setRegularRedeemSc(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
              <span className="text-slate-400 self-center">SC</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">For USD bank transfers</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveFees} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Redemption Settings'}
          </Button>
        </div>
      </Card>

      {/* Platform Info */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-violet-500/20 rounded-lg">
            <Globe className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Platform Information</h2>
            <p className="text-xs text-slate-400">Environment and version info</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Environment</span>
              <Badge variant="secondary">{process.env.NODE_ENV || 'production'}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Supabase URL</span>
              <span className="text-slate-300 font-mono text-xs">
                {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Stripe Mode</span>
              <Badge variant={process.env.STRIPE_SECRET_KEY?.includes('sk_live') ? 'success' : 'warning'}>
                {process.env.STRIPE_SECRET_KEY?.includes('sk_live') ? 'Live' : 'Test'}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">AI Swarm</span>
              <Badge variant={aiEnabled ? 'success' : 'destructive'}>
                {aiEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">KYC Provider</span>
              <Badge variant="secondary">Stripe Identity</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Referral Reward</span>
              <span className="text-slate-300">+20 SC + 20,000 GC</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}