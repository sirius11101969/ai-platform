import { crmKanbanDescriptor } from './kanbanDescriptor.js'

export const crmKanbanNavigationItem = Object.freeze({
  id: 'crm.kanban.nav',
  label: crmKanbanDescriptor.label,
  route: crmKanbanDescriptor.route,
  domain: crmKanbanDescriptor.id,
  workspaceZone: crmKanbanDescriptor.workspaceZone,
})
