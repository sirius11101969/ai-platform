import { isRegisteredProductEvent } from '../registry/eventRegistry'
import { AS6_PRODUCT_EVENT_SCHEMA_VERSION, sanitizeProductMetadata } from '../schemas/productEvent.schema'
import { AS6_PRODUCT_TELEMETRY_CONFIG } from './telemetryConfig'
import { readStoredProductEvents, writeStoredProductEvents } from './telemetryProvider'

function createEventId() {
  const randomPart = Math.random().toString(36).slice(2, 10)
  return `as6_evt_${Date.now()}_${randomPart}`
}

export function createProductEvent(payload = {}) {
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

export function trackProductEvent(payload = {}, config = AS6_PRODUCT_TELEMETRY_CONFIG) {
  if (!config.enabled) {
    return { ok: true, skipped: true, reason: 'AS6_PRODUCT_TELEMETRY_DISABLED' }
  }

  const created = createProductEvent(payload)
  if (!created.ok) return created

  const currentEvents = readStoredProductEvents(config)
  const nextEvents = writeStoredProductEvents([...currentEvents, created.productEvent], config)

  if (config.consoleMode && typeof console !== 'undefined') {
    console.info('[AS6 Product Intelligence]', created.productEvent)
  }

  return {
    ok: true,
    event: created.productEvent,
    storedCount: nextEvents.length,
  }
}
