import { crmFollowupManifest } from './followupManifest.js'

const registry = new Map([[crmFollowupManifest.domain, crmFollowupManifest]])

export function registerCrmFollowupManifest(manifest = crmFollowupManifest) {
  registry.set(manifest.domain, manifest)
  return manifest
}

export function getCrmFollowupManifest(domain = crmFollowupManifest.domain) {
  return registry.get(domain) || null
}

export function listCrmFollowupManifests() {
  return Array.from(registry.values())
}
