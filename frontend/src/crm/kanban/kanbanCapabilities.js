export const crmKanbanCapabilities = Object.freeze([
  'crm.kanban.view',
  'crm.kanban.move',
  'crm.kanban.group',
  'crm.kanban.trace',
])

export function hasCrmKanbanCapability(capability) {
  return crmKanbanCapabilities.includes(capability)
}
