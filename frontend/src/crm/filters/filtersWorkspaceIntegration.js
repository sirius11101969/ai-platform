import { crmFiltersManifest } from './filtersManifest.js'
import { crmFiltersNavigationItem } from './filtersNavigation.js'
import { listCrmFiltersPanels } from './filtersPanels.js'
import { runCrmFiltersDiagnostics } from './filtersDiagnostics.js'

export const crmFiltersWorkspaceIntegration = Object.freeze({
  id: 'crm.filters.workspace.integration',
  domain: crmFiltersManifest.domain,
  workspace: 'as6.workspace',
  zone: 'crm',
  route: crmFiltersNavigationItem.route,
  navigation: crmFiltersNavigationItem,
  panels: listCrmFiltersPanels(),
  assistantContext: Object.freeze({
    id: 'crm.filters.assistant.context',
    title: 'CRM Filters',
    nextBestAction: 'Apply focused CRM filters before reviewing pipeline, follow-ups or analytics signals.',
  }),
  focusContext: Object.freeze({
    id: 'crm.filters.focus.context',
    title: 'Filters Focus',
    primaryMetric: 'active_filters',
  }),
  diagnostics: runCrmFiltersDiagnostics(),
})

export function getCrmFiltersWorkspaceIntegration() {
  return crmFiltersWorkspaceIntegration
}
