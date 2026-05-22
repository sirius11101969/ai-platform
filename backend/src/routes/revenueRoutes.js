const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')
const controller = require('../controllers/revenueController')

const router = express.Router()
router.get('/revenue/overview', requireAuth, requireWorkspace, controller.overview)
router.get('/revenue/funnel', requireAuth, requireWorkspace, controller.funnel)
router.post('/revenue/activate', requireAuth, requireWorkspace, controller.activate)

module.exports = router
