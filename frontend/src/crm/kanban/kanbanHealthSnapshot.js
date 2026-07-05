import { crmKanbanManifest } from './kanbanManifest.js'

export function createCrmKanbanHealthSnapshot(overrides = {}) {
  return Object.freeze({
    domain: crmKanbanManifest.domain,
    status: 'ready',
    manifestRegistered: true,
    runtimeTraceable: true,
    workspaceReusable: true,
    kanbanColumnsDeclared: true,
    generatedAt: new Date().toISOString(),
    ...overrides,
  })
}
