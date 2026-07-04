import { crmAnalyticsManifest } from './analyticsManifest.js'
import { crmAnalyticsNavigationItem } from './analyticsNavigation.js'
import { listCrmAnalyticsPanels } from './analyticsPanels.js'
import { runCrmAnalyticsDiagnostics } from './analyticsDiagnostics.js'

export const crmAnalyticsWorkspaceIntegration = Object.freeze({
  id: 'crm.analytics.workspace.integration',
  domain: crmAnalyticsManifest.domain,
  workspace: 'as6.workspace',
  zone: 'crm',
  route: crmAnalyticsNavigationItem.route,
  navigation: crmAnalyticsNavigationItem,
  panels: listCrmAnalyticsPanels(),
  assistantContext: Object.freeze({
    id: 'crm.analytics.assistant.context',
    title: 'CRM Analytics',
    nextBestAction: 'Inspect pipeline risks, overdue follow-ups and activity gaps before planning new sales actions.',
  }),
  focusContext: Object.freeze({
    id: 'crm.analytics.focus.context',
    title: 'Analytics Focus',
    primaryMetric: 'pipeline_health',
  }),
  diagnostics: runCrmAnalyticsDiagnostics(),
})

export function getCrmAnalyticsWorkspaceIntegration() {
  return crmAnalyticsWorkspaceIntegration
}
