const pool = require('../db/pool')

const GOVERNANCE = {
  humanApprovalRequired: true,
  noAutonomousCustomerActions: true,
  noAutonomousPricingChanges: true,
}

function isMissingRelation(error) {
  return error?.code === '42P01' || /relation .* does not exist/i.test(error?.message || '')
}

function isSchemaMismatch(error) {
  return error?.code === '42703' || /column .* does not exist/i.test(error?.message || '')
}

async function resolveColumn({ tableName, candidates }) {
  const result = await pool.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = ANY($2::text[])`,
    [tableName, candidates]
  )

  const found = new Set(result.rows.map((row) => row.column_name))
  return candidates.find((column) => found.has(column)) || null
}

async function checkLayer(name, endpoint, queryFn) {
  try {
    const result = await queryFn()
    const hasData = result !== null && result !== undefined
    if (!hasData) {
      console.warn('ai_system_health_layer_missing', { name, endpoint })
      return { name, status: 'missing', endpoint, lastKnownData: null, notes: 'No data found' }
    }
    return { name, status: 'ready', endpoint, lastKnownData: result, notes: 'OK' }
  } catch (error) {
    if (isMissingRelation(error)) {
      console.warn('ai_system_health_layer_missing', { name, endpoint, error: error.message })
      return { name, status: 'missing', endpoint, lastKnownData: null, notes: 'Table not found' }
    }
    if (isSchemaMismatch(error)) {
      console.warn('ai_system_health_layer_degraded', { name, endpoint, error: error.message, reason: 'schema_mismatch' })
      return { name, status: 'degraded', endpoint, lastKnownData: null, notes: 'Schema mismatch' }
    }
    console.warn('ai_system_health_layer_degraded', { name, endpoint, error: error.message })
    return { name, status: 'degraded', endpoint, lastKnownData: null, notes: error.message }
  }
}

async function getSystemHealth({ workspaceId }) {
  const workforceTimestampColumn = await resolveColumn({
    tableName: 'ai_workforce_realtime_metrics',
    candidates: ['created_at', 'computed_at', 'generated_at', 'timestamp', 'updated_at'],
  })
  console.info('ai_system_health_timestamp_resolved', {
    layer: 'Workforce Realtime Metrics',
    table: 'ai_workforce_realtime_metrics',
    column: workforceTimestampColumn,
  })

  const approvalTimestampColumn = await resolveColumn({
    tableName: 'ai_approval_queue',
    candidates: ['created_at', 'computed_at', 'generated_at', 'timestamp', 'updated_at'],
  })
  console.info('ai_system_health_timestamp_resolved', {
    layer: 'Approval Center Queue',
    table: 'ai_approval_queue',
    column: approvalTimestampColumn,
  })

  const approvalStatusColumn = await resolveColumn({
    tableName: 'ai_approval_queue',
    candidates: ['status', 'approval_status', 'queue_status', 'decision_status', 'state'],
  })
  console.info('ai_system_health_status_resolved', {
    layer: 'Approval Center Queue',
    table: 'ai_approval_queue',
    column: approvalStatusColumn,
  })

  const layers = await Promise.all([
    checkLayer('API Health', '/api/health', async () => ({ status: 'ok' })),
    checkLayer('Revenue Engine', '/api/ai/revenue-engine/snapshot', async () => (await pool.query('SELECT id, created_at FROM ai_revenue_engine_snapshots WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1', [workspaceId])).rows[0] || null),
    checkLayer('Executive Unified Dashboard', '/api/ai/executive-unified-dashboard/overview', async () => (await pool.query('SELECT id, created_at FROM ai_organizational_health WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1', [workspaceId])).rows[0] || null),
    checkLayer('Strategic Planning', '/api/ai/strategic-planning/plans', async () => (await pool.query('SELECT id, created_at FROM ai_strategic_plans WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1', [workspaceId])).rows[0] || null),
    checkLayer('Enterprise Coordination', '/api/ai/enterprise-coordination/sync', async () => (await pool.query('SELECT id, created_at FROM ai_enterprise_coordination_runs WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1', [workspaceId])).rows[0] || null),
    checkLayer('Organizational Memory', '/api/ai/organizational-memory/entries', async () => (await pool.query('SELECT id, created_at FROM ai_organizational_memory WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1', [workspaceId])).rows[0] || null),
    checkLayer('Workforce Realtime Metrics', '/api/ai/workforce/realtime-metrics', async () => {
      if (!workforceTimestampColumn) return null
      const sql = `SELECT id, ${workforceTimestampColumn} AS resolved_timestamp FROM ai_workforce_realtime_metrics WHERE workspace_id=$1 ORDER BY ${workforceTimestampColumn} DESC LIMIT 1`
      return (await pool.query(sql, [workspaceId])).rows[0] || null
    }),
    checkLayer('Approval Center Queue', '/api/ai/approval-center/queue', async () => {
      if (!approvalTimestampColumn && !approvalStatusColumn) return null
      const where = ['workspace_id=$1']
      if (approvalStatusColumn) where.push(`${approvalStatusColumn}='pending_approval'`)
      const orderBy = approvalTimestampColumn ? ` ORDER BY ${approvalTimestampColumn} DESC` : ''
      const selectTimestamp = approvalTimestampColumn ? `, ${approvalTimestampColumn} AS resolved_timestamp` : ''
      const sql = `SELECT id${selectTimestamp} FROM ai_approval_queue WHERE ${where.join(' AND ')}${orderBy} LIMIT 1`
      return (await pool.query(sql, [workspaceId])).rows[0] || null
    }),
    checkLayer('Database', 'postgres', async () => (await pool.query('SELECT NOW() as now')).rows[0] || null),
  ])

  const summary = layers.reduce((acc, layer) => {
    if (layer.status === 'ready') acc.readyCount += 1
    else if (layer.status === 'degraded') acc.degradedCount += 1
    else acc.missingCount += 1
    return acc
  }, { readyCount: 0, degradedCount: 0, missingCount: 0 })

  const status = summary.degradedCount > 0 ? 'degraded' : summary.missingCount > 0 ? 'missing' : 'ready'
  const payload = { status, generatedAt: new Date().toISOString(), governance: GOVERNANCE, layers, summary }
  console.info('ai_system_health_checked', { workspaceId, status, summary })
  return payload

}

module.exports = { getSystemHealth }
