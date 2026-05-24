// ============================================================================
// Predictly — Admin API: AI Employee Task Management
// GET: List tasks with filters (agent_type, status, date range)
// POST: Manually trigger an agent task
// ============================================================================

import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'
import { MOCK_AGENT_TASKS, MOCK_AGENT_ACTIONS } from '@/lib/ai-employees'
import { validateTaskTrigger } from '@/lib/ai-employees-zod'
import type { AgentTask, AgentAction, AgentType, AgentTaskStatus } from '@/types'

// In-memory task store (in production, this would be persisted to DB)
let taskStore: AgentTask[] = [...MOCK_AGENT_TASKS]
let actionStore: AgentAction[] = [...MOCK_AGENT_ACTIONS]
let taskCounter = taskStore.length

export async function GET(request: Request) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const agentType = searchParams.get('agent_type') as AgentType | null
    const status = searchParams.get('status') as AgentTaskStatus | null
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const limit = parseInt(searchParams.get('limit') ?? '50', 10)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    let filtered = [...taskStore]

    // Apply filters
    if (agentType) {
      filtered = filtered.filter((t) => t.agent_type === agentType)
    }
    if (status) {
      filtered = filtered.filter((t) => t.status === status)
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime()
      filtered = filtered.filter((t) => new Date(t.created_at).getTime() >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime()
      filtered = filtered.filter((t) => new Date(t.created_at).getTime() <= to)
    }

    // Sort by created_at descending
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const total = filtered.length
    const tasks = filtered.slice(offset, offset + limit)

    return NextResponse.json({
      tasks,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('[AI Employees Tasks GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validateTaskTrigger(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid task trigger', details: validation.errors },
        { status: 400 }
      )
    }

    const { agent_type, action_type, input, priority } = validation.data!

    taskCounter++
    const newTask: AgentTask = {
      id: `task-manual-${taskCounter}`,
      agent_type,
      action_type,
      status: 'pending',
      input: input ?? {},
      output: null,
      confidence: null,
      retry_count: 0,
      max_retries: 3,
      priority,
      scheduled_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      error_message: null,
      parent_task_id: null,
      created_at: new Date().toISOString(),
    }

    // Simulate the task starting after a brief delay
    const newAction: AgentAction = {
      id: `aa-manual-${taskCounter}`,
      task_id: newTask.id,
      agent_type,
      action_type,
      description: `Manually triggered ${action_type} task for ${agent_type} agent`,
      input_summary: JSON.stringify(input ?? {}).slice(0, 100),
      output_summary: 'Task queued for execution',
      confidence: null,
      duration_ms: null,
      created_at: new Date().toISOString(),
    }

    taskStore = [newTask, ...taskStore]
    actionStore = [newAction, ...actionStore]

    return NextResponse.json({
      success: true,
      task: newTask,
      action: newAction,
      message: `${agent_type} task triggered successfully`,
    })
  } catch (error) {
    console.error('[AI Employees Tasks POST] Error:', error)
    return NextResponse.json({ error: 'Failed to trigger task' }, { status: 500 })
  }
}
