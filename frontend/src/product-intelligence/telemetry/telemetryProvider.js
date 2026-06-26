import { AS6_PRODUCT_TELEMETRY_CONFIG } from './telemetryConfig'

function canUseLocalStorage() {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage)
  } catch {
    return false
  }
}

export function readStoredProductEvents(config = AS6_PRODUCT_TELEMETRY_CONFIG) {
  if (config.storageMode !== 'localStorage' || !canUseLocalStorage()) return []

  try {
    const raw = window.localStorage.getItem(config.storageKey)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeStoredProductEvents(events, config = AS6_PRODUCT_TELEMETRY_CONFIG) {
  if (config.storageMode !== 'localStorage' || !canUseLocalStorage()) return events

  const nextEvents = Array.isArray(events) ? events.slice(-config.maxEvents) : []

  try {
    window.localStorage.setItem(config.storageKey, JSON.stringify(nextEvents))
  } catch {
    return nextEvents
  }

  return nextEvents
}
