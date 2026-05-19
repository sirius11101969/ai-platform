const crypto = require('crypto')

const SECRET = process.env.REALTIME_SESSION_SECRET || process.env.JWT_SECRET || 'dev-realtime-secret'

function stableJson(value) {
  return JSON.stringify(value || {}, Object.keys(value || {}).sort())
}

function createSignedSessionId({ workspaceId, nonce, createdAt }) {
  const payload = `${workspaceId}:${nonce}:${createdAt}`
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url').slice(0, 16)
  return `ors_${nonce}_${sig}`
}

function verifySignedSessionId({ sessionId, workspaceId, createdAt }) {
  if (!sessionId || !sessionId.startsWith('ors_')) return false
  const parts = sessionId.split('_')
  if (parts.length < 3) return false
  const nonce = parts[1]
  const expected = createSignedSessionId({ workspaceId, nonce, createdAt })
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sessionId))
}

function signBrowserToken(payload) {
  const body = Buffer.from(stableJson(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

function verifyBrowserToken(token) {
  if (!token || !token.includes('.')) return null
  const [body, sig] = token.split('.')
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig || ''))) return null
  return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
}

function validateOrigin(origin) {
  const allowed = (process.env.REALTIME_ALLOWED_ORIGINS || process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (!origin) return true
  if (!allowed.length || allowed.includes('*') || allowed.includes('true')) return true
  return allowed.includes(origin)
}

module.exports = { createSignedSessionId, verifySignedSessionId, signBrowserToken, verifyBrowserToken, validateOrigin }
