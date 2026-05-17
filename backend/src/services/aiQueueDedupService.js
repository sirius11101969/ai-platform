const ACTIVE_DEDUP_STATUSES = ['pending_approval', 'approved', 'executing', 'completed', 'executed']
function normalizeSourceMessageId(sourceMessageId) {
  const value = String(sourceMessageId || '').trim()
  return value || null
}

async function findDuplicateQueueItem(client, { workspaceId, leadId, actionType, sourceMessageId, extraPayloadMatch = null, statuses = ACTIVE_DEDUP_STATUSES }) {
  const sourceId = normalizeSourceMessageId(sourceMessageId)
  const statusList = Array.isArray(statuses) && statuses.length ? statuses : ACTIVE_DEDUP_STATUSES
  const values = [workspaceId, leadId, actionType, statusList]
  const clauses = [
    'q.workspace_id = $1',
    'q.lead_id = $2',
    'q.action_type = $3',
    'q.status = ANY($4)',
  ]

  if (sourceId) {
    values.push(sourceId)
    const sourceParam = `$${values.length}`
    clauses.push(`(
      q.payload->>'sourceMessageId' = ${sourceParam}
      OR q.payload->>'telegramMessageId' = ${sourceParam}
      OR q.payload->>'emailMessageId' = ${sourceParam}
      OR q.payload->'metadata'->>'sourceMessageId' = ${sourceParam}
      OR q.payload->'metadata'->>'telegramMessageId' = ${sourceParam}
      OR q.payload->'metadata'->>'emailMessageId' = ${sourceParam}
      OR to_jsonb(q)->>'source_message_id' = ${sourceParam}
      OR to_jsonb(q)->>'sourceMessageId' = ${sourceParam}
      OR to_jsonb(q)->'metadata'->>'sourceMessageId' = ${sourceParam}
      OR to_jsonb(q)->'metadata'->>'telegramMessageId' = ${sourceParam}
      OR to_jsonb(q)->'metadata'->>'emailMessageId' = ${sourceParam}
    )`)
  }

  if (extraPayloadMatch?.key && extraPayloadMatch.value !== undefined && extraPayloadMatch.value !== null) {
    const key = String(extraPayloadMatch.key)
    if (!/^[A-Za-z0-9_]+$/.test(key)) throw new Error('Invalid payload match key')
    values.push(String(extraPayloadMatch.value))
    clauses.push(`q.payload->>'${key}' = $${values.length}`)
  }

  const result = await client.query(
    `SELECT id, status
       FROM ai_worker_queue q
      WHERE ${clauses.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT 1`,
    values
  )
  return result.rows[0] || null
}

function logDuplicateSkipped({ workspaceId, leadId, actionType, sourceMessageId, duplicateId }) {
  console.info('[ai-queue] duplicate skipped', { workspaceId, leadId, actionType, sourceMessageId: normalizeSourceMessageId(sourceMessageId), duplicateId })
}

module.exports = { ACTIVE_DEDUP_STATUSES, findDuplicateQueueItem, logDuplicateSkipped, normalizeSourceMessageId }
