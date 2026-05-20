const pool = require('../db/pool')
const { createWorkforceRealtimeOperationsService } = require('../services/aiWorkforce/workforceRealtimeOperationsService')

const realtimeService = createWorkforceRealtimeOperationsService({ db: pool })

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

async function listAgents(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, role, status, workload, collaboration_state, metadata, created_at, updated_at
       FROM ai_workforce_agents
       WHERE workspace_id = $1
       ORDER BY updated_at DESC`,
      [req.workspace.id]
    )
    res.json({ items: result.rows })
  } catch (error) { next(error) }
}

async function listTasks(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, task_type, status, payload, execution_dependencies, created_at, updated_at
       FROM ai_workforce_tasks
       WHERE workspace_id = $1
       ORDER BY updated_at DESC`,
      [req.workspace.id]
    )
    res.json({ items: result.rows })
  } catch (error) { next(error) }
}

async function listAssignments(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT a.id, a.task_id, a.agent_id, a.status, a.created_at,
              t.task_type, t.status AS task_status,
              ag.role AS worker_role, ag.status AS worker_status, ag.workload
       FROM ai_workforce_assignments a
       JOIN ai_workforce_tasks t ON t.id = a.task_id
       JOIN ai_workforce_agents ag ON ag.id = a.agent_id
       WHERE a.workspace_id = $1
       ORDER BY a.created_at DESC`,
      [req.workspace.id]
    )
    res.json({ items: result.rows })
  } catch (error) { next(error) }
}

async function listExecutionPlans(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT p.id, p.task_id, p.assignment_id, p.status, p.plan, p.created_at, p.updated_at,
              t.task_type, a.agent_id, ag.role AS worker_role
       FROM ai_workforce_execution_plans p
       JOIN ai_workforce_tasks t ON t.id = p.task_id
       LEFT JOIN ai_workforce_assignments a ON a.id = p.assignment_id
       LEFT JOIN ai_workforce_agents ag ON ag.id = a.agent_id
       WHERE p.workspace_id = $1
       ORDER BY p.updated_at DESC`,
      [req.workspace.id]
    )
    res.json({ items: result.rows })
  } catch (error) { next(error) }
}

async function getMetrics(req, res, next) {
  try {
    const [agents, assignments, collabs, approvals, plans] = await Promise.all([
      pool.query(`SELECT status, workload FROM ai_workforce_agents WHERE workspace_id = $1`, [req.workspace.id]),
      pool.query(`SELECT status FROM ai_workforce_assignments WHERE workspace_id = $1`, [req.workspace.id]),
      pool.query(`SELECT COUNT(*)::int AS count FROM ai_workforce_collaboration_events WHERE workspace_id = $1 AND event_type IN ('worker_collaboration_started', 'collaboration_started')`, [req.workspace.id]),
      pool.query(`SELECT COUNT(*)::int AS count FROM ai_worker_queue WHERE workspace_id = $1 AND status = 'pending_approval'`, [req.workspace.id]),
      pool.query(`SELECT status FROM ai_workforce_execution_plans WHERE workspace_id = $1`, [req.workspace.id]),
    ])

    const workers = agents.rows || []
    const total = workers.length
    const activeWorkers = workers.filter((w) => ['assigned', 'collaborating', 'active'].includes(w.status)).length
    const idleWorkers = workers.filter((w) => w.status === 'idle').length
    const assignedWorkers = workers.filter((w) => w.status === 'assigned').length
    const workloadDistribution = workers.map((w) => ({ status: w.status, workload: toNumber(w.workload) }))
    const utilization = total ? Math.round((workers.reduce((sum, w) => sum + Math.min(100, toNumber(w.workload) * 20), 0) / (total * 100)) * 100) : 0
    const overloadedWorkers = workers.filter((w) => toNumber(w.workload) >= 4).length

    const waitingApprovalPlans = (plans.rows || []).filter((row) => row.status === 'waiting_approval').length

    res.json({
      metrics: {
        activeWorkers,
        idleWorkers,
        assignedWorkers,
        collaborationSessions: collabs.rows?.[0]?.count || 0,
        pendingApprovals: approvals.rows?.[0]?.count || 0,
        executionPlansWaitingApproval: waitingApprovalPlans,
        workloadDistribution,
        workforceUtilizationPercent: utilization,
        approvalBottlenecks: approvals.rows?.[0]?.count || 0,
        overloadedWorkers,
        idleCapacity: idleWorkers,
        executionQueuePressure: assignments.rows.filter((row) => row.status === 'assigned').length,
        collaborationEfficiency: total ? Math.round((activeWorkers / total) * 100) : 0,
      },
    })
  } catch (error) { next(error) }
}

async function listEvents(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500)
    const items = await realtimeService.listEvents(req.workspace.id, limit)
    res.json({ items })
  } catch (error) { next(error) }
}

async function listActivityStream(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500)
    const items = await realtimeService.listActivityStream(req.workspace.id, limit)
    res.json({ items })
  } catch (error) { next(error) }
}

async function getRealtimeMetrics(req, res, next) {
  try {
    const metrics = await realtimeService.computeRealtimeMetrics(req.workspace.id)
    const bottlenecks = await realtimeService.detectBottlenecks(req.workspace.id)
    const escalations = await realtimeService.detectEscalationChains(req.workspace.id)
    const collaboration = await realtimeService.summarizeCollaborationActivity(req.workspace.id)
    res.json({ metrics, bottlenecks, escalations, collaboration })
  } catch (error) { next(error) }
}

async function getRealtimeMetricsHistory(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200)
    const items = await realtimeService.listRealtimeMetricsHistory(req.workspace.id, limit)
    res.json({ items })
  } catch (error) { next(error) }
}

async function simulateActivity(req, res, next) {
  try {
    const workspaceId = req.workspace.id
    const workerId = req.body.workerId || null
    const demoEvents = [
      { eventType: 'worker_activity_started', severity: 'info', payload: { summary: 'Simulation started', safeSimulation: true, noExternalOutreach: true, noRealCustomerActions: true } },
      { eventType: 'worker_collaboration_started', severity: 'info', payload: { summary: 'Simulation collaboration', safeSimulation: true, noExternalOutreach: true, noRealCustomerActions: true } },
      { eventType: 'execution_plan_updated', severity: 'info', payload: { summary: 'Simulation execution plan updated', safeSimulation: true, noExternalOutreach: true, noRealCustomerActions: true } },
      { eventType: 'worker_activity_completed', severity: 'info', payload: { summary: 'Simulation complete', safeSimulation: true, noExternalOutreach: true, noRealCustomerActions: true } },
    ]
    const created = []
    for (const event of demoEvents) {
      // eslint-disable-next-line no-await-in-loop
      created.push(await realtimeService.publishWorkforceEvent({ workspaceId, workerId, ...event }))
    }
    res.status(201).json({ items: created, safety: { noExternalOutreach: true, noRealCustomerActions: true } })
  } catch (error) { next(error) }
}

module.exports = { listAgents, listTasks, listAssignments, listExecutionPlans, getMetrics, listEvents, listActivityStream, getRealtimeMetrics, getRealtimeMetricsHistory, simulateActivity }
