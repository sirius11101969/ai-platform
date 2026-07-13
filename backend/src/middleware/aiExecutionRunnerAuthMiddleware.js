const crypto = require('crypto')
const { verifyToken } = require('../services/authService')

const RUNNER_LOG_PREFIX = '[ai-execution-runner]'
const INTERNAL_KEY_HEADER = 'x-ai-execution-key'

function safeEquals(left, right) {
  const leftBuffer = Buffer.from(String(left || ''), 'utf8')
  const rightBuffer = Buffer.from(String(right || ''), 'utf8')

  if (leftBuffer.length === 0 || leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function isInternalAdminKeyAccepted(req) {
  const configuredKey = process.env.AI_EXECUTION_ADMIN_KEY
  const providedKey = req.get(INTERNAL_KEY_HEADER)

  return Boolean(configuredKey && providedKey && safeEquals(providedKey, configuredKey))
}

async function requireAiExecutionRunnerAuth(req, res, next) {
  if (isInternalAdminKeyAccepted(req)) {
    req.aiExecutionAuth = { type: 'internal_admin_key' }
    console.info(`${RUNNER_LOG_PREFIX} internal admin key accepted`)
    return next()
  }

  const header = req.get('authorization') || ''
  const [scheme, token] = header.split(' ')

  if (scheme === 'Bearer' && token) {
    try {
      req.user = await verifyToken(token)
      req.aiExecutionAuth = { type: 'user_jwt' }
      return next()
    } catch (error) {
      // Fall through to the same safe response used for missing credentials.
    }
  }

  return res.status(401).json({ error: 'Unauthorized' })
}

module.exports = {
  requireAiExecutionRunnerAuth,
  _private: {
    isInternalAdminKeyAccepted,
    safeEquals,
  },
}
