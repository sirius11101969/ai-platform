export const crmKanbanPanels = Object.freeze([
  Object.freeze({
    id: 'crm.kanban.board',
    title: 'Kanban Board',
    zone: 'main',
  }),
  Object.freeze({
    id: 'crm.kanban.summary',
    title: 'Kanban Summary',
    zone: 'rightRail',
  }),
])

export function listCrmKanbanPanels() {
  return crmKanbanPanels
}
