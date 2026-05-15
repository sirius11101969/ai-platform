const express = require('express')
const { webhook } = require('../controllers/telegramController')

const router = express.Router()

router.post('/webhook/:secret', webhook)

module.exports = router
