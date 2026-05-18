const express = require('express')
const { enqueueTest, health, runOnce } = require('../controllers/aiExecutionRunnerController')
const { requireAiExecutionRunnerAuth } = require('../middleware/aiExecutionRunnerAuthMiddleware')

const router = express.Router()

router.use(requireAiExecutionRunnerAuth)

router.get('/health', health)
router.post('/enqueue-test', enqueueTest)
router.post('/run-once', runOnce)

module.exports = router
