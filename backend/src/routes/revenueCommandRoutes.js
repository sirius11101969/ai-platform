const express = require('express')
const { getRevenueCommandCenter, sendRevenueTelegramReport } = require('../controllers/revenueCommandController')

const router = express.Router()

router.get('/command-center', getRevenueCommandCenter)
router.post('/telegram-report', sendRevenueTelegramReport)

module.exports = router
