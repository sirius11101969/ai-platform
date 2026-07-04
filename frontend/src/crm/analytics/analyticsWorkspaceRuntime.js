import { createCrmAnalyticsRuntime } from './analyticsRuntime.js'
import { getCrmAnalyticsWorkspaceIntegration } from './analyticsWorkspaceIntegration.js'
import { traceCrmAnalyticsRuntime } from './analyticsTracer.js'

export function createCrmAnalyticsWorkspaceRuntime() {
  const domainRuntime = createCrmAnalyticsRuntime()
  const workspaceIntegration = getCrmAnalyticsWorkspaceIntegration()
  const trace = traceCrmAnalyticsRuntime('workspace.integration.created')
  return Object.freeze({
    id: 'crm.analytics.workspace.runtime',
    domain: domainRuntime.domain,
    domainRuntime,
    workspaceIntegration,
    trace,
    status: workspaceIntegration.diagnostics.result === 'PASS' ? 'ready' : 'degraded',
  })
}
