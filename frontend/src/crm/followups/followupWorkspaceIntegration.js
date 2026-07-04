import { crmFollowupManifest } from './followupManifest.js'
import { crmFollowupNavigationItem } from './followupNavigation.js'
import { listCrmFollowupPanels } from './followupPanels.js'
import { runCrmFollowupDiagnostics } from './followupDiagnostics.js'

export const crmFollowupWorkspaceIntegration = Object.freeze({
  id: 'crm.followups.workspace.integration',
  domain: crmFollowupManifest.domain,
  workspace: 'as6.workspace',
  zone: 'crm',
  route: crmFollowupNavigationItem.route,
  navigation: crmFollowupNavigationItem,
  panels: listCrmFollowupPanels(),
  assistantContext: Object.freeze({
    id: 'crm.followups.assistant.context',
    title: 'CRM Followups',
    nextBestAction: 'Review overdue and due-today follow-ups before opening new outreach tasks.',
  }),
  focusContext: Object.freeze({
    id: 'crm.followups.focus.context',
    title: 'Follow-up Focus',
    primaryMetric: 'due_today',
  }),
  diagnostics: runCrmFollowupDiagnostics(),
})

export function getCrmFollowupWorkspaceIntegration() {
  return crmFollowupWorkspaceIntegration
}
