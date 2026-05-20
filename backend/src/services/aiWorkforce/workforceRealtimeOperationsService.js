const pool = require('../../db/pool')
const { createWorkforceEventBus } = require('./workforceEventBus')

function createWorkforceRealtimeOperationsService({ db = pool, eventBus = createWorkforceEventBus() } = {}) {
  async function publishWorkforceEvent({ workspaceId, eventType, workerId = null, collaborationId = null, executionPlanId = null, severity = 'info', payload = {} }) {
    const publishedAt = new Date().toISOString()
    const event = { workspaceId, eventType, workerId, collaborationId, executionPlanId, severity, payload, publishedAt }
    eventBus.publish(event)

    const result = await db.query(
      `INSERT INTO ai_workforce_events (workspace_id, event_type, worker_id, collaboration_id, execution_plan_id, severity, payload, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
       RETURNING id, workspace_id, event_type, worker_id, collaboration_id, execution_plan_id, severity, payload, published_at`,
      [workspaceId, eventType, workerId, collaborationId, executionPlanId, severity, JSON.stringify(payload || {}), publishedAt]
    )

    await db.query(
      `INSERT INTO ai_workforce_activity_stream (workspace_id, event_id, stream_type, summary, metadata)
       VALUES ($1,$2,$3,$4,$5::jsonb)`,
      [workspaceId, result.rows[0].id, 'workforce_event', payload.summary || eventType, JSON.stringify(payload || {})]
    )

    console.info('ai_workforce_event_published', { workspaceId, eventType, workerId, collaborationId, executionPlanId, severity })
    return result.rows[0]
  }

  async function computeRealtimeMetrics(workspaceId) {
    const [events, assignments] = await Promise.all([
      db.query(`SELECT event_type, severity, published_at FROM ai_workforce_events WHERE workspace_id = $1 AND published_at > NOW() - INTERVAL '24 hours'`, [workspaceId]),
      db.query(`SELECT status FROM ai_workforce_assignments WHERE workspace_id = $1`, [workspaceId]),
    ])
    const bottlenecksDetected = events.rows.filter((row) => row.event_type === 'workforce_bottleneck_detected').length
    const escalationsDetected = events.rows.filter((row) => row.event_type === 'workforce_escalation_detected').length
    const activeAssignments = assignments.rows.filter((row) => row.status === 'assigned').length
    const collaborationSessions = events.rows.filter((row) => row.event_type === 'worker_collaboration_started').length
    const throughput24h = events.rows.filter((row) => row.event_type === 'worker_activity_completed').length

    const computedAt = new Date().toISOString()
    const metrics = {
      bottlenecksDetected,
      escalationsDetected,
      activeAssignments,
      collaborationSessions,
      throughput24h,
      timestamp: computedAt,
      source: 'realtime_workforce_operations',
    }
    await db.query(
      `INSERT INTO ai_workforce_realtime_metrics (workspace_id, metrics, computed_at)
       VALUES ($1,$2::jsonb,$3)`,
      [workspaceId, JSON.stringify(metrics), computedAt]
    )
    console.info('ai_workforce_realtime_metrics_snapshot_persisted', { workspaceId, computedAt, source: metrics.source, metrics })
    return metrics
  }

  async function listRealtimeMetricsHistory(workspaceId, limit = 50) {
    const result = await db.query(
      `SELECT id, workspace_id, metrics, computed_at
       FROM ai_workforce_realtime_metrics
       WHERE workspace_id = $1
       ORDER BY computed_at DESC
       LIMIT $2`,
      [workspaceId, limit]
    )
    return result.rows
  }

  async function detectBottlenecks(workspaceId) {
    const result = await db.query(`SELECT id, agent_id, status, created_at FROM ai_workforce_assignments WHERE workspace_id = $1 AND status = 'assigned' ORDER BY created_at ASC`, [workspaceId])
    const stale = result.rows.filter((row) => new Date(row.created_at).getTime() < (Date.now() - (1000 * 60 * 30)))
    if (!stale.length) return []
    console.info('ai_workforce_bottleneck_detected', { workspaceId, count: stale.length })
    return stale
  }

  async function detectEscalationChains(workspaceId) {
    const result = await db.query(
      `SELECT id, event_type, payload, published_at
       FROM ai_workforce_events
       WHERE workspace_id = $1 AND event_type = 'workforce_escalation_detected'
       ORDER BY published_at DESC
       LIMIT 20`,
      [workspaceId]
    )
    return result.rows
  }

  async function summarizeCollaborationActivity(workspaceId) {
    const result = await db.query(
      `SELECT COUNT(*)::int AS started,
              COUNT(*) FILTER (WHERE event_type = 'worker_collaboration_completed')::int AS completed
       FROM ai_workforce_events
       WHERE workspace_id = $1 AND event_type IN ('worker_collaboration_started','worker_collaboration_completed')`,
      [workspaceId]
    )
    return result.rows[0]
  }

  async function listEvents(workspaceId, limit = 100) {
    const result = await db.query(`SELECT * FROM ai_workforce_events WHERE workspace_id = $1 ORDER BY published_at DESC LIMIT $2`, [workspaceId, limit])
    return result.rows
  }

  async function listActivityStream(workspaceId, limit = 100) {
    const result = await db.query(
      `SELECT s.id, s.stream_type, s.summary, s.metadata, s.created_at, e.event_type, e.worker_id, e.severity
       FROM ai_workforce_activity_stream s
       JOIN ai_workforce_events e ON e.id = s.event_id
       WHERE s.workspace_id = $1
       ORDER BY s.created_at DESC LIMIT $2`,
      [workspaceId, limit]
    )
    return result.rows
  }

  return { publishWorkforceEvent, computeRealtimeMetrics, listRealtimeMetricsHistory, detectBottlenecks, detectEscalationChains, summarizeCollaborationActivity, listEvents, listActivityStream }
}

module.exports = { createWorkforceRealtimeOperationsService }
