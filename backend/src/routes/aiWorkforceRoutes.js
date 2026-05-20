const express = require('express')
const controller = require('../controllers/aiWorkforceController')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')

const router = express.Router()

router.use(requireAuth, requireWorkspace)
router.get('/workforce/agents', controller.listAgents)
router.get('/workforce/tasks', controller.listTasks)
router.get('/workforce/assignments', controller.listAssignments)
router.get('/workforce/execution-plans', controller.listExecutionPlans)
router.get('/workforce/metrics', controller.getMetrics)

module.exports = router
