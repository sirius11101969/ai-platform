import { crmKanbanManifest } from './kanbanManifest.js'
import { crmKanbanNavigationItem } from './kanbanNavigation.js'
import { listCrmKanbanPanels } from './kanbanPanels.js'
import { runCrmKanbanDiagnostics } from './kanbanDiagnostics.js'

export const crmKanbanWorkspaceIntegration = Object.freeze({
  id: 'crm.kanban.workspace.integration',
  domain: crmKanbanManifest.domain,
  workspace: 'as6.workspace',
  zone: 'crm',
  route: crmKanbanNavigationItem.route,
  navigation: crmKanbanNavigationItem,
  panels: listCrmKanbanPanels(),
  assistantContext: Object.freeze({
    id: 'crm.kanban.assistant.context',
    title: 'CRM Kanban',
    nextBestAction: 'Review blocked columns and move the most important customer work to the next useful state.',
  }),
  focusContext: Object.freeze({
    id: 'crm.kanban.focus.context',
    title: 'Kanban Focus',
    primaryMetric: 'blocked_items',
  }),
  diagnostics: runCrmKanbanDiagnostics(),
})

export function getCrmKanbanWorkspaceIntegration() {
  return crmKanbanWorkspaceIntegration
}
