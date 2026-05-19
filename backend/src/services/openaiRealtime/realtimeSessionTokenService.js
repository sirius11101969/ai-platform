const crypto = require('crypto')
const security = require('./realtimeSecurityManager')

function mintBrowserToken({ sessionId, workspaceId, ttlSeconds = 180 }) {
  const issuedAt = Math.floor(Date.now() / 1000)
  const expiresAt = issuedAt + ttlSeconds
  const nonce = crypto.randomUUID()
  const token = security.signBrowserToken({ typ: 'openai_realtime_browser_session', sessionId, workspaceId, iat: issuedAt, exp: expiresAt, nonce })
  return { token, issuedAt, expiresAt, nonce }
}

function validateBrowserToken(token) {
  const payload = security.verifyBrowserToken(token)
  if (!payload) return { valid: false, reason: 'invalid_signature' }
  if (payload.exp < Math.floor(Date.now() / 1000)) return { valid: false, reason: 'expired' }
  return { valid: true, payload }
}

module.exports = { mintBrowserToken, validateBrowserToken }
