const crypto = require('crypto')

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url')
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function parseExpiresIn(value = '7d') {
  const match = String(value).match(/^(\d+)([smhd])$/)
  if (!match) return 7 * 24 * 60 * 60

  const amount = Number(match[1])
  const unit = match[2]
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 }
  return amount * multipliers[unit]
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return secret
}

function sign(payload) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'HS256', typ: 'JWT' }
  const body = {
    ...payload,
    iat: now,
    exp: now + parseExpiresIn(process.env.JWT_EXPIRES_IN),
  }

  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(body))}`
  const signature = crypto.createHmac('sha256', getJwtSecret()).update(unsignedToken).digest('base64url')
  return `${unsignedToken}.${signature}`
}

function verify(token) {
  const [encodedHeader, encodedPayload, signature] = String(token || '').split('.')
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('Malformed token')
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`
  const expectedSignature = crypto.createHmac('sha256', getJwtSecret()).update(unsignedToken).digest('base64url')

  const actualSignature = Buffer.from(signature)
  const validSignature = Buffer.from(expectedSignature)

  if (actualSignature.length !== validSignature.length || !crypto.timingSafeEqual(actualSignature, validSignature)) {
    throw new Error('Invalid token signature')
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload))
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired')
  }

  return payload
}

module.exports = { sign, verify }
