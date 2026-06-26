export const AS6_PRODUCT_EVENT_SCHEMA_VERSION = 'as6-product-event/v1'

export const AS6_ALLOWED_PRODUCT_EVENT_FIELDS = Object.freeze([
  'id',
  'event',
  'category',
  'journey',
  'screen',
  'source',
  'version',
  'timestamp',
  'metadata',
  'schemaVersion',
])

export const AS6_FORBIDDEN_METADATA_KEYS = Object.freeze([
  'email',
  'phone',
  'password',
  'secret',
  'token',
  'accessToken',
  'refreshToken',
  'ip',
  'cookie',
  'session',
  'authorization',
])

export function sanitizeProductMetadata(metadata = {}) {
  if (!metadata || typeof metadata !== 'object') return {}

  return Object.entries(metadata).reduce((safe, [key, value]) => {
    const normalizedKey = String(key)
    const lowerKey = normalizedKey.toLowerCase()

    const forbidden = AS6_FORBIDDEN_METADATA_KEYS.some((blocked) =>
      lowerKey.includes(blocked.toLowerCase())
    )

    if (forbidden) return safe

    if (value === null || value === undefined) {
      safe[normalizedKey] = value
      return safe
    }

    if (['string', 'number', 'boolean'].includes(typeof value)) {
      safe[normalizedKey] = value
      return safe
    }

    safe[normalizedKey] = String(value)
    return safe
  }, {})
}
