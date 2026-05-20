const express = require('express')
const controller = require('../controllers/aiWorkforceController')
const { requireAiControlGateway } = require('../middleware/aiControlGateway')

const router = express.Router()

router.use(requireAiControlGateway({
  missingWorkspaceError: 'workspaceId is required for admin key workforce access',
}))
router.use((req, _res, next) => {
  console.info('ai_workforce_gateway_auth_success', {
    method: req.method,
    path: req.originalUrl || req.url,
    authMode: req.aiControl?.authMode || null,
    workspaceId: req.aiControl?.workspaceId || req.workspace?.id || null,
    userId: req.aiControl?.userId || req.user?.id || null,
  })
  console.info('ai_workforce_workspace_resolved', {
    method: req.method,
    path: req.originalUrl || req.url,
    workspaceId: req.workspace?.id || req.aiControl?.workspaceId || null,
  })
  next()
})
router.get('/workforce/agents', controller.listAgents)
router.get('/workforce/tasks', controller.listTasks)
router.get('/workforce/assignments', controller.listAssignments)
router.get('/workforce/execution-plans', controller.listExecutionPlans)
router.get('/workforce/metrics', controller.getMetrics)
router.get('/workforce/events', controller.listEvents)
router.get('/workforce/activity-stream', controller.listActivityStream)
router.get('/workforce/realtime-metrics', controller.getRealtimeMetrics)
router.get('/workforce/realtime-metrics/history', controller.getRealtimeMetricsHistory)
router.post('/workforce/simulate-activity', controller.simulateActivity)

module.exports = router
