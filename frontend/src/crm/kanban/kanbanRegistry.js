import { crmKanbanManifest } from './kanbanManifest.js'

const registry = new Map([[crmKanbanManifest.domain, crmKanbanManifest]])

export function registerCrmKanbanManifest(manifest = crmKanbanManifest) {
  registry.set(manifest.domain, manifest)
  return manifest
}

export function getCrmKanbanManifest(domain = crmKanbanManifest.domain) {
  return registry.get(domain) || null
}

export function listCrmKanbanManifests() {
  return Array.from(registry.values())
}
