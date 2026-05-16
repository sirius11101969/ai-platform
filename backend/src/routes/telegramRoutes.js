const express = require('express')
const { integrationWebhook, webhook } = require('../controllers/telegramController')

const router = express.Router()

router.post('/webhook', integrationWebhook)
router.post('/webhook/:secret', webhook)

module.exports = router
