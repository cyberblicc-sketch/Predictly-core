// ============================================================================
// Predictly — Admin API: AI Employee Management
// GET: Returns all agent configs + system health + recent task stats
// POST: Update agent config (enabled, schedule, confidence_threshold, rate_limit)
// ============================================================================

import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'
import {
  AGENT_CONFIGS,
  MOCK_AGENT_TASKS,
  MOCK_AGENT_FAILURES,
  getSystemHealth,
  getTaskQueueLength,
  getAgentStatus,
} from '@/lib/ai-employees'
import { validateConfigUpdate } from '@/lib/ai-employees-zod'
import type { AgentType, AgentConfig } from '@/types'

// In-memory config overrides (in production, this would be persisted to DB)
const configOverrides: Partial<Record<AgentType, Partial<AgentConfig>>> = {}

function getMergedConfigs(): Record<AgentType, AgentConfig & { status: string }> {
  const result = {} as Record<AgentType, AgentConfig & { status: string }>
  for (const [key, baseConfig] of Object.entries(AGENT_CONFIGS)) {
    const agentType = key as AgentType
    const override = configOverrides[agentType] ?? {}
    result[agentType] = {
      ...baseConfig,
      ...override,
      id: agentType,
    } as AgentConfig & { status: string }
    // Attach live status
    result[agentType].status = getAgentStatus(agentType)
  }
  return result
}

export async function GET() {
  try {
    // Verify admin session
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const configs = getMergedConfigs()
    const systemHealth = getSystemHealth()
    const pendingTasks = getTaskQueueLength()

    // Task stats for the last 24h
    const now = Date.now()
    const last24h = now - 24 * 3600_000
    const recentTasks = MOCK_AGENT_TASKS.filter(
      (t) => new Date(t.created_at).getTime() > last24h
    )
    const completedToday = recentTasks.filter((t) => t.status === 'completed').length
    const failedToday = recentTasks.filter((t) => t.status === 'failed').length

    // Per-agent stats
    const agentStats = Object.entries(AGENT_CONFIGS).map(([key, config]) => {
      const agentType = key as AgentType
      const agentTasks = MOCK_AGENT_TASKS.filter((t) => t.agent_type === agentType)
      const agentFailures = MOCK_AGENT_FAILURES.filter((f) => f.agent_type === agentType && !f.resolved)
      return {
        agent_type: agentType,
        status: getAgentStatus(agentType),
        total_tasks: config.total_tasks,
        success_rate: config.success_rate,
        active_failures: agentFailures.length,
        pending_tasks: agentTasks.filter((t) => t.status === 'pending').length,
        running_tasks: agentTasks.filter((t) => t.status === 'running').length,
      }
    })

    return NextResponse.json({
      configs,
      system_health: systemHealth,
      health_status: systemHealth > 0.8 ? 'healthy' : systemHealth > 0.5 ? 'degraded' : 'critical',
      pending_tasks: pendingTasks,
      tasks_completed_today: completedToday,
      tasks_failed_today: failedToday,
      agent_stats: agentStats,
    })
  } catch (error) {
    console.error('[AI Employees GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch AI employee data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verify admin session
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validateConfigUpdate(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid config update', details: validation.errors },
        { status: 400 }
      )
    }

    const { agent_type, updates } = validation.data!

    // Apply updates to the in-memory override
    const currentOverride = configOverrides[agent_type] ?? {}
    configOverrides[agent_type] = { ...currentOverride, ...updates }

    const updatedConfigs = getMergedConfigs()
    const updatedConfig = updatedConfigs[agent_type]

    return NextResponse.json({
      success: true,
      config: updatedConfig,
      message: `${updatedConfig.name} configuration updated`,
    })
  } catch (error) {
    console.error('[AI Employees POST] Error:', error)
    return NextResponse.json({ error: 'Failed to update agent config' }, { status: 500 })
  }
}
