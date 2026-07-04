import { crmAnalyticsManifest } from './analyticsManifest.js'

const registry = new Map([[crmAnalyticsManifest.domain, crmAnalyticsManifest]])

export function registerCrmAnalyticsManifest(manifest = crmAnalyticsManifest) {
  registry.set(manifest.domain, manifest)
  return manifest
}

export function getCrmAnalyticsManifest(domain = crmAnalyticsManifest.domain) {
  return registry.get(domain) || null
}

export function listCrmAnalyticsManifests() {
  return Array.from(registry.values())
}
