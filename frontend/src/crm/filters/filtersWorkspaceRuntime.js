import { createCrmFiltersRuntime } from './filtersRuntime.js'
import { getCrmFiltersWorkspaceIntegration } from './filtersWorkspaceIntegration.js'
import { traceCrmFiltersRuntime } from './filtersTracer.js'

export function createCrmFiltersWorkspaceRuntime() {
  const domainRuntime = createCrmFiltersRuntime()
  const workspaceIntegration = getCrmFiltersWorkspaceIntegration()
  const trace = traceCrmFiltersRuntime('workspace.integration.created')
  return Object.freeze({
    id: 'crm.filters.workspace.runtime',
    domain: domainRuntime.domain,
    domainRuntime,
    workspaceIntegration,
    trace,
    status: workspaceIntegration.diagnostics.result === 'PASS' ? 'ready' : 'degraded',
  })
}
