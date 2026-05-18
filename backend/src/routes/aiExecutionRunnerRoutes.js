const express = require('express')
const { enqueueOpenAiTest, enqueueTest, health, runOnce } = require('../controllers/aiExecutionRunnerController')
const { requireAiExecutionRunnerAuth } = require('../middleware/aiExecutionRunnerAuthMiddleware')

const router = express.Router()

router.use(requireAiExecutionRunnerAuth)

router.get('/health', health)
router.post('/enqueue-test', enqueueTest)
router.post('/enqueue-openai-test', enqueueOpenAiTest)
router.post('/run-once', runOnce)

module.exports = router
