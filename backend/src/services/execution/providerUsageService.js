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
  const number = Number(value || 0)
  return Number.isFinite(number) && number > 0 ? number : 0
}

async function recordProviderUsage(usage = {}, client = pool) {
  const normalized = {
    workspaceId: normalizeDbValue(usage.workspaceId),
    userId: normalizeDbValue(usage.userId),
    taskId: normalizeDbValue(usage.taskId),
    provider: String(usage.provider || '').trim(),
    model: normalizeDbValue(String(usage.model || '').trim() || null),
    operation: String(usage.operation || '').trim(),
    promptTokens: safeNumber(usage.promptTokens),
    completionTokens: safeNumber(usage.completionTokens),
    totalTokens: safeNumber(usage.totalTokens),
    providerCostUsd: safeNumber(usage.providerCostUsd),
    billableCredits: Math.trunc(safeNumber(usage.billableCredits)),
    latencyMs: Math.trunc(safeNumber(usage.latencyMs)),
    status: normalizeDbValue(usage.status || 'succeeded'),
    metadata: normalizeDbValue(usage.metadata || {}),
  }

  if (!normalized.provider || !normalized.operation) return null

  const result = await client.query(
    `INSERT INTO ai_provider_usage(
       workspace_id, user_id, task_id, provider, model, operation,
       prompt_tokens, completion_tokens, total_tokens, provider_cost_usd,
       billable_credits, latency_ms, status, metadata
     ) VALUES($1::uuid,$2::uuid,$3::uuid,$4::text,$5::text,$6::text,$7::integer,$8::integer,$9::integer,$10::numeric,$11::integer,$12::integer,$13::text,$14::jsonb)
     RETURNING id`,
    [
      normalizeDbValue(normalized.workspaceId),
      normalizeDbValue(normalized.userId),
      normalizeDbValue(normalized.taskId),
      normalizeDbValue(normalized.provider),
      normalizeDbValue(normalized.model),
      normalizeDbValue(normalized.operation),
      normalized.promptTokens,
      normalized.completionTokens,
      normalized.totalTokens,
      normalized.providerCostUsd,
      normalized.billableCredits,
      normalized.latencyMs,
      normalizeDbValue(normalized.status),
      safeJson(normalized.metadata),
    ]
  )
  return result.rows[0]
}

module.exports = { normalizeDbValue, recordProviderUsage, safeJson }
