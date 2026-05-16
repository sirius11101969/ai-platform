const { createPublicLead, schedulePublicLeadAnalysis } = require('../services/publicLeadService')

function getClientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  return forwarded || req.ip || req.socket?.remoteAddress || 'unknown'
}

async function createLead(req, res) {
  try {
    const result = await createPublicLead(req.body || {}, {
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'] || '',
    })
    schedulePublicLeadAnalysis(result.actionId)
    res.status(201).json({ success: true, leadId: result.leadId })
  } catch (error) {
    const statusCode = error.statusCode && error.statusCode < 500 ? error.statusCode : 500
    if (statusCode >= 500) console.error('Public lead capture failed', error)
    res.status(statusCode).json({ error: statusCode === 429 ? 'Too many requests' : 'Unable to submit lead' })
  }
}

module.exports = { createLead }
