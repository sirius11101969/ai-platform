import { resolveCrmKanbanDomain } from './kanbanResolver.js'
import { createCrmKanbanHealthSnapshot } from './kanbanHealthSnapshot.js'

export function runCrmKanbanDiagnostics() {
  const resolution = resolveCrmKanbanDomain()
  const health = createCrmKanbanHealthSnapshot({
    manifestRegistered: resolution.ok,
  })
  return Object.freeze({
    diagnostic: 'AS6_CRM_KANBAN_FOUNDATION',
    result: resolution.ok ? 'PASS' : 'FAIL',
    resolution,
    health,
  })
}
