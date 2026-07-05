import { CRM_KANBAN_DOMAIN, CRM_KANBAN_ENTITY } from './kanbanContract.js'

export const crmKanbanDescriptor = Object.freeze({
  id: CRM_KANBAN_DOMAIN,
  entity: CRM_KANBAN_ENTITY,
  title: 'CRM Kanban',
  label: 'Kanban',
  description: 'Reusable CRM Kanban layer for visual deal, activity and follow-up movement inside AS6 Workspace.',
  route: '/crm/kanban',
  workspaceZone: 'crm',
  capability: 'crm.kanban.manage',
  owner: 'AS6 CRM',
})
