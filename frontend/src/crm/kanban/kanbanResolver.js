import { getCrmKanbanManifest } from './kanbanRegistry.js'

export function resolveCrmKanbanDomain() {
  const manifest = getCrmKanbanManifest()
  if (!manifest) {
    return Object.freeze({
      ok: false,
      code: 'AS6_CRM_KANBAN_MANIFEST_MISSING',
      manifest: null,
    })
  }
  return Object.freeze({
    ok: true,
    code: 'AS6_CRM_KANBAN_MANIFEST_RESOLVED',
    manifest,
  })
}
