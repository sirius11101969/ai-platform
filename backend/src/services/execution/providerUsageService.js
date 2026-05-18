const pool = require('../../db/pool')

function normalizeDbValue(value) {
  if (value === undefined) return null
  if (value instanceof Date) return value
  if (Array.isArray(value)) return value.map((item) => normalizeDbValue(item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeDbValue(item)]))
  }
  return value
}

function safeJson(value) {
  return JSON.stringify(normalizeDbValue(value) ?? {})
}

function safeNumber(value) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) && number > 0 ? number : 0
}

function safeText(value, fallback = null) {
  const normalized = value ?? fallback
  if (normalized === null) return null
  const text = String(normalized).trim()
  return text || fallback
}

const VALID_PROVIDER_USAGE_STATUSES = new Set(['submitted', 'succeeded', 'failed', 'cancelled'])

function normalizeStatus(status) {
  const normalized = String(status || 'succeeded').trim().toLowerCase()
  return VALID_PROVIDER_USAGE_STATUSES.has(normalized) ? normalized : 'failed'
}

async function recordProviderUsage(usage = {}, client = pool) {
  const normalized = {
    workspaceId: normalizeDbValue(usage.workspaceId ?? null),
    userId: normalizeDbValue(usage.userId ?? null),
    taskId: normalizeDbValue(usage.taskId ?? null),
    provider: safeText(usage.provider, 'openai'),
    model: normalizeDbValue(safeText(usage.model, null)),
    operation: safeText(usage.operation, 'text_generation'),
    promptTokens: safeNumber(usage.promptTokens),
    completionTokens: safeNumber(usage.completionTokens),
    totalTokens: safeNumber(usage.totalTokens),
    providerCostUsd: safeNumber(usage.providerCostUsd),
    billableCredits: Math.trunc(safeNumber(usage.billableCredits)),
    latencyMs: Math.trunc(safeNumber(usage.latencyMs)),
    status: normalizeStatus(usage.status),
    metadata: normalizeDbValue(usage.metadata ?? {}),
  }

  const params = [
    normalized.workspaceId,
    normalized.userId,
    normalized.taskId,
    normalized.provider,
    normalized.model,
    normalized.operation,
    normalized.promptTokens,
    normalized.completionTokens,
    normalized.totalTokens,
    normalized.providerCostUsd,
    normalized.billableCredits,
    normalized.latencyMs,
    normalized.status,
    safeJson(normalized.metadata),
  ]


  const result = await client.query(
    `INSERT INTO ai_provider_usage (
       workspace_id,
       user_id,
       task_id,
       provider,
       model,
       operation,
       prompt_tokens,
       completion_tokens,
       total_tokens,
       provider_cost_usd,
       billable_credits,
       latency_ms,
       status,
       metadata
     )
     VALUES (
       $1::uuid,
       $2::uuid,
       $3::uuid,
       $4::text,
       $5::text,
       $6::text,
       $7::integer,
       $8::integer,
       $9::integer,
       $10::numeric,
       $11::integer,
       $12::integer,
       $13::text,
       $14::jsonb
     )
     RETURNING id`,
    params
  )
  return result.rows[0]
}

module.exports = { normalizeDbValue, normalizeStatus, recordProviderUsage, safeJson, safeText }
