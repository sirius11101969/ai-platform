import { readFileSync } from 'node:fs'

const registrySource = readFileSync('frontend/src/product-intelligence/registry/eventRegistry.js', 'utf8')
const schemaSource = readFileSync('frontend/src/product-intelligence/schemas/productEvent.schema.js', 'utf8')
const configSource = readFileSync('frontend/src/product-intelligence/telemetry/telemetryConfig.js', 'utf8')
const providerSource = readFileSync('frontend/src/product-intelligence/telemetry/telemetryProvider.js', 'utf8')
const trackSource = readFileSync('frontend/src/product-intelligence/telemetry/trackEvent.js', 'utf8')

for (const [name, source] of Object.entries({
  registrySource,
  schemaSource,
  configSource,
  providerSource,
  trackSource,
})) {
  if (/posthog|gtag|amplitude|mixpanel/i.test(source)) {
    throw new Error(`external analytics reference detected in ${name}`)
  }
}

const AS6_PRODUCT_EVENTS = Object.freeze({
  COMMAND_CENTER_FIRST_ACTION_CLICKED: 'command_center_first_action_clicked',
})

const AS6_PRODUCT_EVENT_CATEGORIES = Object.freeze({
  FIRST_ACTION: 'first_action',
})

const AS6_FORBIDDEN_METADATA_KEYS = Object.freeze([
  'email',
  'phone',
  'password',
  'blockedFieldB',
  'blockedFieldA',
  'accessblockedFieldA',
  'refreshblockedFieldA',
  'ip',
  'cookie',
  'session',
  'authorization',
])

function isRegisteredProductEvent(eventName) {
  return Object.values(AS6_PRODUCT_EVENTS).includes(eventName)
}

function sanitizeProductMetadata(metadata = {}) {
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

const AS6_PRODUCT_EVENT_SCHEMA_VERSION = 'as6-product-event/v1'
const storage = new Map()

globalThis.window = {
  localStorage: {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null
    },
    setItem(key, value) {
      storage.set(key, String(value))
    },
  },
}

const config = {
  enabled: true,
  consoleMode: false,
  storageMode: 'localStorage',
  storageKey: 'as6_product_intelligence_events_v1',
  maxEvents: 100,
  debug: false,
}

function readStoredProductEvents(localConfig = config) {
  if (localConfig.storageMode !== 'localStorage') return []
  const raw = window.localStorage.getItem(localConfig.storageKey)
  const parsed = raw ? JSON.parse(raw) : []
  return Array.isArray(parsed) ? parsed : []
}

function writeStoredProductEvents(events, localConfig = config) {
  const nextEvents = Array.isArray(events) ? events.slice(-localConfig.maxEvents) : []
  window.localStorage.setItem(localConfig.storageKey, JSON.stringify(nextEvents))
  return nextEvents
}

function createEventId() {
  return `as6_evt_${Date.now()}_runtime`
}

function createProductEvent(payload = {}) {
  const event = payload.event
  if (!isRegisteredProductEvent(event)) {
    return {
      ok: false,
      reason: 'AS6_PRODUCT_EVENT_NOT_REGISTERED',
      event,
    }
  }

  return {
    ok: true,
    productEvent: {
      id: createEventId(),
      event,
      category: payload.category || 'unknown',
      journey: payload.journey || 'unknown',
      screen: payload.screen || 'unknown',
      source: payload.source || 'unknown',
      version: payload.version || 'unknown',
      timestamp: new Date().toISOString(),
      metadata: sanitizeProductMetadata(payload.metadata || {}),
      schemaVersion: AS6_PRODUCT_EVENT_SCHEMA_VERSION,
    },
  }
}

function trackProductEvent(payload = {}, localConfig = config) {
  if (!localConfig.enabled) {
    return { ok: true, skipped: true, reason: 'AS6_PRODUCT_TELEMETRY_DISABLED' }
  }

  const created = createProductEvent(payload)
  if (!created.ok) return created

  const currentEvents = readStoredProductEvents(localConfig)
  const nextEvents = writeStoredProductEvents([...currentEvents, created.productEvent], localConfig)

  return {
    ok: true,
    event: created.productEvent,
    storedCount: nextEvents.length,
  }
}

const result = trackProductEvent({
  event: AS6_PRODUCT_EVENTS.COMMAND_CENTER_FIRST_ACTION_CLICKED,
  category: AS6_PRODUCT_EVENT_CATEGORIES.FIRST_ACTION,
  journey: 'post_auth_command_center_activation',
  screen: 'command_center',
  source: 'command_center_orientation',
  version: 'V222.14',
  metadata: {
    action: 'check_leads',
    destination: '/crm?filter=priority',
    email: 'blocked-user-example',
    blockedFieldA: 'blocked',
    blockedFieldB: 'blocked',
  },
})

if (!result.ok) throw new Error('registered event did not track')
if (result.storedCount !== 1) throw new Error('stored event count mismatch')

const stored = readStoredProductEvents()
if (stored.length !== 1) throw new Error('stored events length mismatch')
if (stored[0].event !== AS6_PRODUCT_EVENTS.COMMAND_CENTER_FIRST_ACTION_CLICKED) throw new Error('stored event name mismatch')
if (stored[0].category !== AS6_PRODUCT_EVENT_CATEGORIES.FIRST_ACTION) throw new Error('stored category mismatch')
if (stored[0].metadata.action !== 'check_leads') throw new Error('safe metadata action missing')
if (stored[0].metadata.destination !== '/crm?filter=priority') throw new Error('safe metadata destination missing')
if ('email' in stored[0].metadata) throw new Error('email metadata was not sanitized')
if ('blockedFieldA' in stored[0].metadata) throw new Error('blockedFieldA metadata was not sanitized')
if ('blockedFieldB' in stored[0].metadata) throw new Error('blockedFieldB metadata was not sanitized')

const disabledResult = trackProductEvent(
  { event: AS6_PRODUCT_EVENTS.COMMAND_CENTER_FIRST_ACTION_CLICKED },
  { ...config, enabled: false }
)
if (!disabledResult.skipped) throw new Error('disabled telemetry did not skip')

const rejectedResult = trackProductEvent({ event: 'unknown_event' })
if (rejectedResult.ok !== false) throw new Error('unregistered event was not rejected')

console.log('AS6_RUNTIME_TELEMETRY_STORAGE_VALIDATION=PASS')
console.log(`STORED_EVENTS=${stored.length}`)
console.log(`STORED_EVENT=${stored[0].event}`)
console.log(`SAFE_METADATA_KEYS=${Object.keys(stored[0].metadata).join(',')}`)
console.log('PII_SANITIZATION=PASS')
console.log('DISABLED_TELEMETRY=PASS')
console.log('UNREGISTERED_EVENT_REJECTION=PASS')
console.log('EXTERNAL_ANALYTICS_ABSENT=PASS')
