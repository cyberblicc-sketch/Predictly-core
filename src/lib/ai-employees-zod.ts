// ============================================================================
// Predictly — AI Employee Zod Validation Schemas
// Strict validation for all agent inputs/outputs
// CRITICAL: Market candidates can NEVER have status='approved' or 'published'
// directly — they must go through the human review process
// ============================================================================

import { z } from 'zod'

// ── Enum Schemas ─────────────────────────────────────────────────────────────

export const AgentTypeSchema = z.enum([
  'scout',
  'oddsmaker',
  'clerk',
  'fraud_analyst',
  'content',
  'supervisor',
])

export const AgentTaskStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled',
  'escalated',
])

export const AgentActionTypeSchema = z.enum([
  'scout_scan',
  'market_generate',
  'db_write',
  'fraud_check',
  'content_generate',
  'supervisor_coordinate',
  'market_review',
  'resolution_check',
])

export const MarketCandidateStatusSchema = z.enum([
  'pending_review',
  'approved',
  'rejected',
  'published',
  'expired',
])

export const FraudFlagSeveritySchema = z.enum(['low', 'medium', 'high', 'critical'])

export const FraudFlagStatusSchema = z.enum(['open', 'investigating', 'resolved', 'dismissed'])

export const ContentQueueStatusSchema = z.enum([
  'pending',
  'generating',
  'ready',
  'published',
  'failed',
])

export const ContentTypeSchema = z.enum([
  'social_post',
  'market_summary',
  'seo_description',
  'trending_report',
  'daily_recap',
])

export const CategorySchema = z.enum([
  'Politics',
  'Crypto',
  'Sports',
  'Tech',
  'Economics',
  'Pop Culture',
  'Science',
  'World',
  'Stocks',
])

export const CategoryOrGeneralSchema = z.enum([
  'Politics',
  'Crypto',
  'Sports',
  'Tech',
  'Economics',
  'Pop Culture',
  'Science',
  'World',
  'Stocks',
  'General',
])

export const FraudFlagTypeSchema = z.enum([
  'wash_trading',
  'referral_abuse',
  'suspicious_volume',
  'insider_trading',
  'coordinated_trading',
  'unusual_pattern',
  'multi_account',
])

export const MarketPotentialSchema = z.enum(['high', 'medium', 'low', 'none'])

export const MemoryTypeSchema = z.enum([
  'finding',
  'pattern',
  'preference',
  'correction',
  'context',
])

// ── Core Schemas ─────────────────────────────────────────────────────────────

/**
 * Scout Finding Schema — validates scout scan outputs
 */
export const scoutFindingSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  source_url: z.string().url().nullable(),
  title: z.string().min(5).max(500),
  summary: z.string().min(10).max(2000),
  category: CategoryOrGeneralSchema,
  confidence: z.number().min(0).max(1),
  sentiment_score: z.number().min(-1).max(1),
  entities: z.array(z.string().min(1)).min(1),
  topic_tags: z.array(z.string().min(1)).min(1),
  market_potential: MarketPotentialSchema,
  processed: z.boolean(),
  market_candidate_id: z.string().nullable(),
  created_at: z.string().datetime(),
}).strict()

/**
 * Market Candidate Schema — CRITICAL QUARANTINE LAYER
 * AI-generated candidates MUST ALWAYS have status='pending_review'
 * Status 'approved' or 'published' is ONLY allowed via human review endpoint
 */
export const marketCandidateSchema = z.object({
  id: z.string().min(1),
  scout_finding_id: z.string().nullable(),
  question: z.string().min(10).max(1000),
  short_title: z.string().min(3).max(100),
  description: z.string().min(20).max(5000),
  category: CategorySchema,
  outcomes: z.array(z.string().min(1)).min(2).max(10),
  estimated_probabilities: z.array(z.number().min(0).max(1)).min(2).max(10),
  resolution_criteria: z.string().min(10).max(2000),
  resolver_source: z.string().min(1),
  close_date: z.string().datetime().nullable(),
  suggested_liquidity: z.number().nonnegative(),
  semantic_hash: z.string().min(1),
  duplicate_of: z.string().nullable(),
  status: z.literal('pending_review'), // CRITICAL: Only pending_review allowed for AI-generated
  reviewed_by: z.string().nullable(),
  reviewed_at: z.string().datetime().nullable(),
  review_notes: z.string().nullable(),
  published_market_id: z.string().nullable(),
  created_at: z.string().datetime(),
}).strict()

/**
 * Market Candidate Creation Schema — for creating new candidates
 * Always defaults status to pending_review
 */
export const marketCandidateCreateSchema = z.object({
  scout_finding_id: z.string().nullable().optional(),
  question: z.string().min(10).max(1000),
  short_title: z.string().min(3).max(100),
  description: z.string().min(20).max(5000),
  category: CategorySchema,
  outcomes: z.array(z.string().min(1)).min(2).max(10),
  estimated_probabilities: z.array(z.number().min(0).max(1)).min(2).max(10),
  resolution_criteria: z.string().min(10).max(2000),
  resolver_source: z.string().min(1),
  close_date: z.string().datetime().nullable().optional(),
  suggested_liquidity: z.number().nonnegative().optional().default(5000),
}).strict()

/**
 * Market Candidate Review Schema — for human approve/reject actions
 * This is the ONLY way status can change from pending_review
 */
export const marketCandidateReviewSchema = z.object({
  candidate_id: z.string().min(1),
  action: z.enum(['approve', 'reject']),
  review_notes: z.string().min(1).max(2000), // Required for both approve and reject
  reviewed_by: z.string().min(1),
}).strict()

/**
 * Fraud Flag Schema
 */
export const fraudFlagSchema = z.object({
  id: z.string().min(1),
  user_id: z.string().nullable(),
  market_id: z.string().nullable(),
  flag_type: FraudFlagTypeSchema,
  severity: FraudFlagSeveritySchema,
  status: FraudFlagStatusSchema,
  evidence: z.record(z.unknown()),
  risk_score: z.number().min(0).max(1),
  agent_finding: z.string().min(1),
  reviewed_by: z.string().nullable(),
  reviewed_at: z.string().datetime().nullable(),
  resolution: z.string().nullable(),
  auto_action_taken: z.string().nullable(),
  created_at: z.string().datetime(),
}).strict()

/**
 * Fraud Flag Update Schema — for admin review actions
 */
export const fraudFlagUpdateSchema = z.object({
  flag_id: z.string().min(1),
  action: z.enum(['investigate', 'resolve', 'dismiss']),
  resolution: z.string().min(1).max(2000).optional(),
  reviewed_by: z.string().min(1),
}).strict()

/**
 * Content Queue Schema
 */
export const contentQueueSchema = z.object({
  id: z.string().min(1),
  content_type: ContentTypeSchema,
  market_id: z.string().nullable(),
  title: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
  metadata: z.record(z.unknown()),
  status: ContentQueueStatusSchema,
  scheduled_publish_at: z.string().datetime().nullable(),
  published_at: z.string().datetime().nullable(),
  agent_task_id: z.string().nullable(),
  created_at: z.string().datetime(),
}).strict()

/**
 * Content Publish Schema — for admin approve/publish actions
 */
export const contentPublishSchema = z.object({
  content_id: z.string().min(1),
  action: z.enum(['approve', 'publish', 'reject']),
  reviewed_by: z.string().min(1),
}).strict()

/**
 * Agent Task Schema
 */
export const agentTaskSchema = z.object({
  id: z.string().min(1),
  agent_type: AgentTypeSchema,
  action_type: AgentActionTypeSchema,
  status: AgentTaskStatusSchema,
  input: z.record(z.unknown()),
  output: z.record(z.unknown()).nullable(),
  confidence: z.number().min(0).max(1).nullable(),
  retry_count: z.number().int().nonnegative(),
  max_retries: z.number().int().nonnegative(),
  priority: z.number().int().min(1).max(10),
  scheduled_at: z.string().datetime(),
  started_at: z.string().datetime().nullable(),
  completed_at: z.string().datetime().nullable(),
  error_message: z.string().nullable(),
  parent_task_id: z.string().nullable(),
  created_at: z.string().datetime(),
}).strict()

/**
 * Agent Task Trigger Schema — for manually triggering a task
 */
export const agentTaskTriggerSchema = z.object({
  agent_type: AgentTypeSchema,
  action_type: AgentActionTypeSchema,
  input: z.record(z.unknown()).optional().default({}),
  priority: z.number().int().min(1).max(10).optional().default(5),
}).strict()

/**
 * Agent Config Update Schema
 */
export const agentConfigUpdateSchema = z.object({
  agent_type: AgentTypeSchema,
  updates: z.object({
    enabled: z.boolean().optional(),
    schedule_cron: z.string().optional(),
    confidence_threshold: z.number().min(0).max(1).optional(),
    rate_limit_per_hour: z.number().int().positive().optional(),
    max_retries: z.number().int().nonnegative().optional(),
    timeout_ms: z.number().positive().optional(),
  }).strict(),
}).strict()

/**
 * Scout Finding Update Schema — for marking findings as processed
 */
export const scoutFindingUpdateSchema = z.object({
  finding_id: z.string().min(1),
  action: z.enum(['mark_processed', 'link_candidate']),
  market_candidate_id: z.string().min(1).optional(), // Required if action is link_candidate
}).strict().refine(
  (data) => {
    if (data.action === 'link_candidate' && !data.market_candidate_id) {
      return false
    }
    return true
  },
  { message: 'market_candidate_id is required when action is link_candidate' }
)

// ── Validation Helper Functions ──────────────────────────────────────────────

/**
 * Validate data against a Zod schema and return typed result or error.
 */
export function validateWithSchema<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`
  )
  return { success: false, errors }
}

/**
 * Validate a market candidate creation request.
 * Enforces the quarantine rule: status must be pending_review.
 */
export function validateCandidateCreation(data: unknown): {
  success: boolean
  data?: z.infer<typeof marketCandidateCreateSchema>
  errors?: string[]
} {
  return validateWithSchema(marketCandidateCreateSchema, data)
}

/**
 * Validate a market candidate review (approve/reject) request.
 */
export function validateCandidateReview(data: unknown): {
  success: boolean
  data?: z.infer<typeof marketCandidateReviewSchema>
  errors?: string[]
} {
  return validateWithSchema(marketCandidateReviewSchema, data)
}

/**
 * Validate a fraud flag update request.
 */
export function validateFraudUpdate(data: unknown): {
  success: boolean
  data?: z.infer<typeof fraudFlagUpdateSchema>
  errors?: string[]
} {
  return validateWithSchema(fraudFlagUpdateSchema, data)
}

/**
 * Validate a content publish request.
 */
export function validateContentAction(data: unknown): {
  success: boolean
  data?: z.infer<typeof contentPublishSchema>
  errors?: string[]
} {
  return validateWithSchema(contentPublishSchema, data)
}

/**
 * Validate an agent task trigger request.
 */
export function validateTaskTrigger(data: unknown): {
  success: boolean
  data?: z.infer<typeof agentTaskTriggerSchema>
  errors?: string[]
} {
  return validateWithSchema(agentTaskTriggerSchema, data)
}

/**
 * Validate agent config update request.
 */
export function validateConfigUpdate(data: unknown): {
  success: boolean
  data?: z.infer<typeof agentConfigUpdateSchema>
  errors?: string[]
} {
  return validateWithSchema(agentConfigUpdateSchema, data)
}
