import { crmFiltersManifest } from './filtersManifest.js'

const registry = new Map([[crmFiltersManifest.domain, crmFiltersManifest]])

export function registerCrmFiltersManifest(manifest = crmFiltersManifest) {
  registry.set(manifest.domain, manifest)
  return manifest
}

export function getCrmFiltersManifest(domain = crmFiltersManifest.domain) {
  return registry.get(domain) || null
}

export function listCrmFiltersManifests() {
  return Array.from(registry.values())
}
