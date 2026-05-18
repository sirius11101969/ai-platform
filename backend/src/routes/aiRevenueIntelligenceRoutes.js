const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')
const controller = require('../controllers/aiRevenueIntelligenceController')

const router = express.Router()

router.get('/revenue-intelligence', requireAuth, requireWorkspace, controller.dashboard)
router.post('/revenue-intelligence/forecast', requireAuth, requireWorkspace, controller.generateForecast)
router.post('/revenue-intelligence/schedule', requireAuth, requireWorkspace, controller.schedule)
router.post('/revenue-intelligence/leads/:leadId/analyze', requireAuth, requireWorkspace, controller.analyzeLead)

module.exports = router
