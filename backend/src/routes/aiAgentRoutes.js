const express = require('express')
const { createAction, listActions, listRuns, metrics, queueInactiveFollowUps } = require('../controllers/aiAgentController')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')

const router = express.Router()
router.use(requireAuth)
router.use(requireWorkspace)
router.get('/actions', listActions)
router.post('/actions', createAction)
router.get('/runs', listRuns)
router.get('/metrics', metrics)
router.post('/followups/queue-inactive', queueInactiveFollowUps)

module.exports = router
