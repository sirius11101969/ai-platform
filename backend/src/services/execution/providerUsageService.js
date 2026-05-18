const pool = require('../../db/pool')

function safeNumber(value) {
  const number = Number(value || 0)
  return Number.isFinite(number) ? number : 0
}

async function recordProviderUsage(usage, client = pool) {
  const normalized = {
    workspaceId: usage.workspaceId || null,
    userId: usage.userId || null,
    taskId: usage.taskId || null,
    provider: String(usage.provider || '').trim(),
    model: String(usage.model || '').trim() || null,
    operation: String(usage.operation || '').trim(),
    promptTokens: safeNumber(usage.promptTokens),
    completionTokens: safeNumber(usage.completionTokens),
    totalTokens: safeNumber(usage.totalTokens),
    providerCostUsd: safeNumber(usage.providerCostUsd),
    billableCredits: Math.trunc(safeNumber(usage.billableCredits)),
    latencyMs: Math.trunc(safeNumber(usage.latencyMs)),
    status: usage.status || 'succeeded',
    metadata: usage.metadata || {},
  }

  if (!normalized.provider || !normalized.operation) return null

  const result = await client.query(
    `INSERT INTO ai_provider_usage(
       workspace_id, user_id, task_id, provider, model, operation,
       prompt_tokens, completion_tokens, total_tokens, provider_cost_usd,
       billable_credits, latency_ms, status, metadata
     ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING id`,
    [
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
      normalized.metadata,
    ]
  )
  return result.rows[0]
}

module.exports = { recordProviderUsage }
