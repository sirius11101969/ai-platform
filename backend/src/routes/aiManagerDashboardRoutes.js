const express = require('express')
const controller = require('../controllers/aiManagerDashboardController')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')

const router = express.Router()
router.use(requireAuth)
router.use(requireWorkspace)

router.get('/manager-dashboard', controller.getManagerDashboard)

module.exports = router
