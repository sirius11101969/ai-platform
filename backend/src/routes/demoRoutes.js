const express = require('express')
const { seedSalesPipeline } = require('../controllers/demoController')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')

const router = express.Router()

router.use(requireAuth)
router.use(requireWorkspace)
router.post('/seed-sales-pipeline', seedSalesPipeline)

module.exports = router
