export const CRM_KANBAN_DOMAIN = 'crm.kanban'

export const CRM_KANBAN_ENTITY = 'kanban'

export const crmKanbanContract = Object.freeze({
  domain: CRM_KANBAN_DOMAIN,
  entity: CRM_KANBAN_ENTITY,
  version: '1.0.0',
  supportedEntities: Object.freeze([
    'deals',
    'activities',
    'followups',
    'filters',
    'analytics',
  ]),
  columns: Object.freeze([
    'new',
    'qualified',
    'in_progress',
    'blocked',
    'won',
    'lost',
  ]),
  outputs: Object.freeze([
    'board_state',
    'column_summary',
    'drag_context',
    'next_best_actions',
  ]),
})
