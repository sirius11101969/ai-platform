export const crmAnalyticsPanels = Object.freeze([
  Object.freeze({
    id: 'crm.analytics.overview',
    title: 'Analytics Overview',
    zone: 'main',
  }),
  Object.freeze({
    id: 'crm.analytics.signals',
    title: 'Analytics Signals',
    zone: 'rightRail',
  }),
])

export function listCrmAnalyticsPanels() {
  return crmAnalyticsPanels
}
