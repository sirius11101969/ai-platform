import { createCrmKanbanRuntime } from './kanbanRuntime.js'
import { getCrmKanbanWorkspaceIntegration } from './kanbanWorkspaceIntegration.js'
import { traceCrmKanbanRuntime } from './kanbanTracer.js'

export function createCrmKanbanWorkspaceRuntime() {
  const domainRuntime = createCrmKanbanRuntime()
  const workspaceIntegration = getCrmKanbanWorkspaceIntegration()
  const trace = traceCrmKanbanRuntime('workspace.integration.created')
  return Object.freeze({
    id: 'crm.kanban.workspace.runtime',
    domain: domainRuntime.domain,
    domainRuntime,
    workspaceIntegration,
    trace,
    status: workspaceIntegration.diagnostics.result === 'PASS' ? 'ready' : 'degraded',
  })
}
