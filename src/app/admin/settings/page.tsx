'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Settings,
  Bot,
  DollarSign,
  ShieldCheck,
  Globe,
  Loader2,
  Save,
  Zap,
  TrendingDown,
  ArrowLeftRight,
  Brain,
} from 'lucide-react'
import { toast } from 'sonner'

interface AIConfig {
  enabled: boolean
  agents: {
    momentum: { enabled: boolean; confidenceThreshold: number; dailyLimit: number }
    contrarian: { enabled: boolean; confidenceThreshold: number; dailyLimit: number }
    arbitrage: { enabled: boolean; confidenceThreshold: number; dailyLimit: number }
    sentiment: { enabled: boolean; confidenceThreshold: number; dailyLimit: number }
  }
  globalDailyLimit: number
}

interface SiteConfig {
  houseFee: number
  platformFee: number
  exitFee: number
  minRedemptionGC: number
  minRedemptionSC: number
  kycProvider: string
  kycAutoApprove: boolean
  kycRequiredDocuments: string[]
  siteName: string
  maintenanceMode: boolean
  announcementBanner: string
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = React.useState('ai')
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const [aiConfig, setAiConfig] = React.useState<AIConfig>({
    enabled: true,
    agents: {
      momentum: { enabled: true, confidenceThreshold: 0.65, dailyLimit: 5000 },
      contrarian: { enabled: true, confidenceThreshold: 0.70, dailyLimit: 3000 },
      arbitrage: { enabled: true, confidenceThreshold: 0.80, dailyLimit: 2000 },
      sentiment: { enabled: true, confidenceThreshold: 0.60, dailyLimit: 4000 },
    },
    globalDailyLimit: 15000,
  })

  const [siteConfig, setSiteConfig] = React.useState<SiteConfig>({
    houseFee: 2,
    platformFee: 1,
    exitFee: 1,
    minRedemptionGC: 1000,
    minRedemptionSC: 50,
    kycProvider: 'stripe',
    kycAutoApprove: false,
    kycRequiredDocuments: ['government_id', 'selfie', 'proof_of_address'],
    siteName: 'Supreme Fusion',
    maintenanceMode: false,
    announcementBanner: '',
  })

  React.useEffect(() => {
    async function fetchConfig() {
      try {
        const [aiRes, configRes] = await Promise.all([
          fetch('/api/admin/ai-config'),
          fetch('/api/admin/config'),
        ])
        const aiData = await aiRes.json()
        const configData = await configRes.json()

        if (aiData.agents) setAiConfig(aiData)
        if (configData.houseFee !== undefined) {
          setSiteConfig({
            houseFee: configData.houseFee * 100,
            platformFee: configData.platformFee * 100,
            exitFee: configData.exitFee * 100,
            minRedemptionGC: configData.minRedemptionGC,
            minRedemptionSC: configData.minRedemptionSC,
            kycProvider: configData.kycProvider,
            kycAutoApprove: configData.kycAutoApprove,
            kycRequiredDocuments: configData.kycRequiredDocuments,
            siteName: configData.siteName,
            maintenanceMode: configData.maintenanceMode,
            announcementBanner: configData.announcementBanner,
          })
        }
      } catch (err) {
        console.error('Failed to fetch config:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  async function handleSaveAI() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiConfig),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('AI configuration saved')
      } else {
        toast.error('Failed to save AI config')
      }
    } catch {
      toast.error('Failed to save AI config')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveConfig() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          houseFee: siteConfig.houseFee / 100,
          platformFee: siteConfig.platformFee / 100,
          exitFee: siteConfig.exitFee / 100,
          minRedemptionGC: siteConfig.minRedemptionGC,
          minRedemptionSC: siteConfig.minRedemptionSC,
          kycProvider: siteConfig.kycProvider,
          kycAutoApprove: siteConfig.kycAutoApprove,
          kycRequiredDocuments: siteConfig.kycRequiredDocuments,
          siteName: siteConfig.siteName,
          maintenanceMode: siteConfig.maintenanceMode,
          announcementBanner: siteConfig.announcementBanner,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Configuration saved')
      } else {
        toast.error('Failed to save configuration')
      }
    } catch {
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleAI() {
    try {
      const res = await fetch('/api/admin/ai-config/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !aiConfig.enabled }),
      })
      const data = await res.json()
      if (data.success) {
        setAiConfig((prev) => ({ ...prev, enabled: !prev.enabled }))
        toast.success(aiConfig.enabled ? 'AI Swarm disabled' : 'AI Swarm enabled')
      }
    } catch {
      toast.error('Failed to toggle AI swarm')
    }
  }

  const agentIcons: Record<string, React.ReactNode> = {
    momentum: <Zap className="h-4 w-4 text-yes" />,
    contrarian: <TrendingDown className="h-4 w-4 text-no" />,
    arbitrage: <ArrowLeftRight className="h-4 w-4 text-brand" />,
    sentiment: <Brain className="h-4 w-4 text-sweeps" />,
  }

  const agentLabels: Record<string, string> = {
    momentum: 'Momentum Agent',
    contrarian: 'Contrarian Agent',
    arbitrage: 'Arbitrage Agent',
    sentiment: 'Sentiment Agent',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-fg flex items-center gap-2">
          <Settings className="h-6 w-6 text-fg-muted" />
          Settings
        </h1>
        <p className="text-sm text-fg-muted mt-1">Configure platform settings</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-bg-subtle border border-border">
          <TabsTrigger value="ai" className="data-[state=active]:bg-brand data-[state=active]:text-white">
            <Bot className="h-4 w-4 mr-1.5" />
            AI Config
          </TabsTrigger>
          <TabsTrigger value="fees" className="data-[state=active]:bg-brand data-[state=active]:text-white">
            <DollarSign className="h-4 w-4 mr-1.5" />
            Fees
          </TabsTrigger>
          <TabsTrigger value="kyc" className="data-[state=active]:bg-brand data-[state=active]:text-white">
            <ShieldCheck className="h-4 w-4 mr-1.5" />
            KYC
          </TabsTrigger>
          <TabsTrigger value="site" className="data-[state=active]:bg-brand data-[state=active]:text-white">
            <Globe className="h-4 w-4 mr-1.5" />
            Site
          </TabsTrigger>
        </TabsList>

        {/* AI Config Tab */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          {/* Master Toggle */}
          <Card className="bg-bg-subtle border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    aiConfig.enabled ? 'bg-yes-soft' : 'bg-no-soft'
                  )}>
                    <Bot className={cn('h-5 w-5', aiConfig.enabled ? 'text-yes' : 'text-no')} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-fg">AI Swarm</div>
                    <div className="text-2xs text-fg-muted">
                      {aiConfig.enabled ? 'Currently active and trading' : 'Currently disabled'}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={aiConfig.enabled}
                  onCheckedChange={handleToggleAI}
                />
              </div>
            </CardContent>
          </Card>

          {/* Global Daily Limit */}
          <Card className="bg-bg-subtle border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-fg">Global Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-fg-muted text-sm">Daily Trade Limit ($)</Label>
                  <Input
                    type="number"
                    value={aiConfig.globalDailyLimit}
                    onChange={(e) =>
                      setAiConfig((prev) => ({
                        ...prev,
                        globalDailyLimit: Number(e.target.value),
                      }))
                    }
                    className="bg-bg-elevated border-border text-fg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Toggles */}
          {Object.entries(aiConfig.agents).map(([key, agent]) => (
            <Card key={key} className="bg-bg-subtle border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {agentIcons[key]}
                    <div>
                      <div className="text-sm font-medium text-fg">{agentLabels[key]}</div>
                      <div className="text-2xs text-fg-muted">
                        {agent.enabled ? 'Active' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={agent.enabled}
                    onCheckedChange={(checked) =>
                      setAiConfig((prev) => ({
                        ...prev,
                        agents: {
                          ...prev.agents,
                          [key]: { ...prev.agents[key as keyof typeof prev.agents], enabled: checked },
                        },
                      }))
                    }
                  />
                </div>
                {agent.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <Label className="text-fg-muted text-xs">Confidence Threshold</Label>
                      <Input
                        type="number"
                        step="0.05"
                        min="0"
                        max="1"
                        value={agent.confidenceThreshold}
                        onChange={(e) =>
                          setAiConfig((prev) => ({
                            ...prev,
                            agents: {
                              ...prev.agents,
                              [key]: {
                                ...prev.agents[key as keyof typeof prev.agents],
                                confidenceThreshold: Number(e.target.value),
                              },
                            },
                          }))
                        }
                        className="bg-bg-elevated border-border text-fg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-fg-muted text-xs">Daily Limit ($)</Label>
                      <Input
                        type="number"
                        value={agent.dailyLimit}
                        onChange={(e) =>
                          setAiConfig((prev) => ({
                            ...prev,
                            agents: {
                              ...prev.agents,
                              [key]: {
                                ...prev.agents[key as keyof typeof prev.agents],
                                dailyLimit: Number(e.target.value),
                              },
                            },
                          }))
                        }
                        className="bg-bg-elevated border-border text-fg"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button
              onClick={handleSaveAI}
              disabled={saving}
              className="bg-brand hover:bg-brand-hover text-white gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save AI Configuration
            </Button>
          </div>
        </TabsContent>

        {/* Fees Tab */}
        <TabsContent value="fees" className="space-y-4 mt-4">
          <Card className="bg-bg-subtle border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-fg">Fee Configuration</CardTitle>
              <CardDescription className="text-fg-muted text-xs">
                All fees are expressed as percentages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-fg-muted text-sm">House Fee (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={siteConfig.houseFee}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({ ...prev, houseFee: Number(e.target.value) }))
                    }
                    className="bg-bg-elevated border-border text-fg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-fg-muted text-sm">Platform Fee (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={siteConfig.platformFee}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({ ...prev, platformFee: Number(e.target.value) }))
                    }
                    className="bg-bg-elevated border-border text-fg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-fg-muted text-sm">Exit Fee (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={siteConfig.exitFee}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({ ...prev, exitFee: Number(e.target.value) }))
                    }
                    className="bg-bg-elevated border-border text-fg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-bg-subtle border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-fg">Minimum Redemption Amounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-fg-muted text-sm">Min GC Redemption</Label>
                  <Input
                    type="number"
                    value={siteConfig.minRedemptionGC}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({ ...prev, minRedemptionGC: Number(e.target.value) }))
                    }
                    className="bg-bg-elevated border-border text-fg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-fg-muted text-sm">Min SC Redemption</Label>
                  <Input
                    type="number"
                    value={siteConfig.minRedemptionSC}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({ ...prev, minRedemptionSC: Number(e.target.value) }))
                    }
                    className="bg-bg-elevated border-border text-fg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveConfig}
              disabled={saving}
              className="bg-brand hover:bg-brand-hover text-white gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Fee Configuration
            </Button>
          </div>
        </TabsContent>

        {/* KYC Tab */}
        <TabsContent value="kyc" className="space-y-4 mt-4">
          <Card className="bg-bg-subtle border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-fg">KYC Provider Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-fg-muted text-sm">KYC Provider</Label>
                  <Select
                    value={siteConfig.kycProvider}
                    onValueChange={(v) => setSiteConfig((prev) => ({ ...prev, kycProvider: v }))}
                  >
                    <SelectTrigger className="bg-bg-elevated border-border text-fg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-elevated border-border">
                      <SelectItem value="stripe">Stripe Identity</SelectItem>
                      <SelectItem value="jumio">Jumio</SelectItem>
                      <SelectItem value="onfido">Onfido</SelectItem>
                      <SelectItem value="manual">Manual Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={siteConfig.kycAutoApprove}
                    onCheckedChange={(checked) =>
                      setSiteConfig((prev) => ({ ...prev, kycAutoApprove: checked }))
                    }
                  />
                  <div>
                    <Label className="text-fg text-sm">Auto-approve</Label>
                    <p className="text-2xs text-fg-muted">Automatically approve verified identities</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-bg-subtle border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-fg">Required Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              {siteConfig.kycRequiredDocuments.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated border border-border">
                  <ShieldCheck className="h-4 w-4 text-fg-muted shrink-0" />
                  <span className="text-sm text-fg flex-1">
                    {doc.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSiteConfig((prev) => ({
                        ...prev,
                        kycRequiredDocuments: prev.kycRequiredDocuments.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="h-7 text-no hover:text-no hover:bg-no-soft"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveConfig}
              disabled={saving}
              className="bg-brand hover:bg-brand-hover text-white gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save KYC Configuration
            </Button>
          </div>
        </TabsContent>

        {/* Site Tab */}
        <TabsContent value="site" className="space-y-4 mt-4">
          <Card className="bg-bg-subtle border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-fg">General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0">
              <div className="space-y-2">
                <Label className="text-fg-muted text-sm">Site Name</Label>
                <Input
                  value={siteConfig.siteName}
                  onChange={(e) =>
                    setSiteConfig((prev) => ({ ...prev, siteName: e.target.value }))
                  }
                  className="bg-bg-elevated border-border text-fg"
                />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated border border-border">
                <Switch
                  checked={siteConfig.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSiteConfig((prev) => ({ ...prev, maintenanceMode: checked }))
                  }
                />
                <div>
                  <Label className="text-fg text-sm">Maintenance Mode</Label>
                  <p className="text-2xs text-fg-muted">
                    When enabled, users will see a maintenance page
                  </p>
                </div>
                {siteConfig.maintenanceMode && (
                  <Badge className="ml-auto bg-no-soft text-no border-no-border text-2xs">
                    Active
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-bg-subtle border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-fg">Announcement Banner</CardTitle>
              <CardDescription className="text-fg-muted text-xs">
                Display a banner message across the top of the site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              <Textarea
                value={siteConfig.announcementBanner}
                onChange={(e) =>
                  setSiteConfig((prev) => ({ ...prev, announcementBanner: e.target.value }))
                }
                placeholder="Enter announcement text (leave empty to hide banner)..."
                className="bg-bg-elevated border-border text-fg min-h-[80px]"
              />
              {siteConfig.announcementBanner && (
                <div className="p-3 rounded-lg bg-warn/10 border border-warn/30">
                  <p className="text-sm text-warn">
                    📢 {siteConfig.announcementBanner}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveConfig}
              disabled={saving}
              className="bg-brand hover:bg-brand-hover text-white gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Site Configuration
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
