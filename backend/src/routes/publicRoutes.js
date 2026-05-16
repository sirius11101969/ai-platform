const express = require('express')
const { createLead } = require('../controllers/publicLeadController')

const router = express.Router()
const buckets = new Map()

function getClientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  return forwarded || req.ip || req.socket?.remoteAddress || 'unknown'
}

function rateLimitByIp(req, res, next) {
  const now = Date.now()
  const windowMs = Number(process.env.PUBLIC_LEADS_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000)
  const maxRequests = Number(process.env.PUBLIC_LEADS_RATE_LIMIT_MAX || 10)
  const ip = getClientIp(req)
  const bucket = buckets.get(ip) || { count: 0, resetAt: now + windowMs }

  if (bucket.resetAt <= now) {
    bucket.count = 0
    bucket.resetAt = now + windowMs
  }

  bucket.count += 1
  buckets.set(ip, bucket)

  if (buckets.size > 10000) {
    for (const [key, value] of buckets.entries()) {
      if (value.resetAt <= now) buckets.delete(key)
    }
  }

  if (bucket.count > maxRequests) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  return next()
}

router.post('/leads', rateLimitByIp, createLead)

module.exports = router
