import { createCrmFollowupRuntime } from './followupRuntime.js'
import { getCrmFollowupWorkspaceIntegration } from './followupWorkspaceIntegration.js'
import { traceCrmFollowupRuntime } from './followupTracer.js'

export function createCrmFollowupWorkspaceRuntime() {
  const domainRuntime = createCrmFollowupRuntime()
  const workspaceIntegration = getCrmFollowupWorkspaceIntegration()
  const trace = traceCrmFollowupRuntime('workspace.integration.created')

  return Object.freeze({
    id: 'crm.followups.workspace.runtime',
    domain: domainRuntime.domain,
    domainRuntime,
    workspaceIntegration,
    trace,
    status: workspaceIntegration.diagnostics.result === 'PASS' ? 'ready' : 'degraded',
  })
}
