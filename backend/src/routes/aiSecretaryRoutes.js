const express = require('express')
const { createAiSecretaryLead, applyAiSecretaryAction, handleAiSecretaryTelegramCallback } = require('../controllers/aiSecretaryController')

const router = express.Router()

router.post('/leads', createAiSecretaryLead)
router.post('/leads/:leadId/actions/:action', applyAiSecretaryAction)
router.post('/telegram/callback', handleAiSecretaryTelegramCallback)

module.exports = router
