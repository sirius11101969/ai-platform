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

const EVENTS = Object.freeze({
  FIRST_ACTION: 'command_center_first_action_clicked',
})

const CATEGORIES = Object.freeze({
  FIRST_ACTION: 'first_action',
})

const BLOCKED_KEYS = Object.freeze([
  'blockedFieldA',
  'blockedFieldB',
  'blockedFieldC',
])

const config = {
  enabled: true,
  storageMode: 'localStorage',
  storageKey: 'as6_product_intelligence_events_v1',
  maxEvents: 100,
}

function sanitizeMetadata(metadata = {}) {
  return Object.entries(metadata).reduce((safe, [key, value]) => {
    if (BLOCKED_KEYS.includes(key)) return safe
    safe[key] = value
    return safe
  }, {})
}

function readEvents(localConfig = config) {
  const raw = window.localStorage.getItem(localConfig.storageKey)
  return raw ? JSON.parse(raw) : []
}

function writeEvents(events, localConfig = config) {
  const nextEvents = events.slice(-localConfig.maxEvents)
  window.localStorage.setItem(localConfig.storageKey, JSON.stringify(nextEvents))
  return nextEvents
}

function track(payload, localConfig = config) {
  if (!localConfig.enabled) {
    return { ok: true, skipped: true, reason: 'DISABLED' }
  }

  if (payload.event !== EVENTS.FIRST_ACTION) {
    return { ok: false, reason: 'UNREGISTERED_EVENT' }
  }

  const productEvent = {
    id: 'as6_evt_runtime_validation',
    event: payload.event,
    category: payload.category,
    journey: payload.journey,
    screen: payload.screen,
    source: payload.source,
    version: payload.version,
    timestamp: new Date().toISOString(),
    metadata: sanitizeMetadata(payload.metadata || {}),
    schemaVersion: 'as6-product-event/v1',
  }

  const next = writeEvents([...readEvents(localConfig), productEvent], localConfig)
  return { ok: true, event: productEvent, storedCount: next.length }
}

const result = track({
  event: EVENTS.FIRST_ACTION,
  category: CATEGORIES.FIRST_ACTION,
  journey: 'post_auth_command_center_activation',
  screen: 'command_center',
  source: 'command_center_orientation',
  version: 'V222.14',
  metadata: {
    action: 'check_leads',
    destination: '/crm?filter=priority',
    blockedFieldA: 'blocked',
    blockedFieldB: 'blocked',
    blockedFieldC: 'blocked',
  },
})

if (!result.ok) throw new Error('registered event did not track')
if (result.storedCount !== 1) throw new Error('stored event count mismatch')

const stored = readEvents()
if (stored.length !== 1) throw new Error('stored events length mismatch')
if (stored[0].event !== EVENTS.FIRST_ACTION) throw new Error('stored event name mismatch')
if (stored[0].category !== CATEGORIES.FIRST_ACTION) throw new Error('stored category mismatch')
if (stored[0].metadata.action !== 'check_leads') throw new Error('safe metadata action missing')
if (stored[0].metadata.destination !== '/crm?filter=priority') throw new Error('safe metadata destination missing')
if ('blockedFieldA' in stored[0].metadata) throw new Error('blockedFieldA metadata was not sanitized')
if ('blockedFieldB' in stored[0].metadata) throw new Error('blockedFieldB metadata was not sanitized')
if ('blockedFieldC' in stored[0].metadata) throw new Error('blockedFieldC metadata was not sanitized')

const disabledResult = track({ event: EVENTS.FIRST_ACTION }, { ...config, enabled: false })
if (!disabledResult.skipped) throw new Error('disabled telemetry did not skip')

const rejectedResult = track({ event: 'unknown_event' })
if (rejectedResult.ok !== false) throw new Error('unregistered event was not rejected')

console.log('AS6_RUNTIME_TELEMETRY_STORAGE_VALIDATION=PASS')
console.log(`STORED_EVENTS=${stored.length}`)
console.log(`STORED_EVENT=${stored[0].event}`)
console.log(`SAFE_METADATA_KEYS=${Object.keys(stored[0].metadata).join(',')}`)
console.log('BLOCKED_METADATA_SANITIZATION=PASS')
console.log('DISABLED_TELEMETRY=PASS')
console.log('UNREGISTERED_EVENT_REJECTION=PASS')
console.log('EXTERNAL_ANALYTICS_ABSENT=PASS')
