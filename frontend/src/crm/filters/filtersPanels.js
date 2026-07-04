export const crmFiltersPanels = Object.freeze([
  Object.freeze({
    id: 'crm.filters.builder',
    title: 'Filters Builder',
    zone: 'main',
  }),
  Object.freeze({
    id: 'crm.filters.summary',
    title: 'Active Filters Summary',
    zone: 'rightRail',
  }),
])

export function listCrmFiltersPanels() {
  return crmFiltersPanels
}
