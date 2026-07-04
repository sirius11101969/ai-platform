import { crmAnalyticsDescriptor } from './analyticsDescriptor.js'

export const crmAnalyticsNavigationItem = Object.freeze({
  id: 'crm.analytics.nav',
  label: crmAnalyticsDescriptor.label,
  route: crmAnalyticsDescriptor.route,
  domain: crmAnalyticsDescriptor.id,
  workspaceZone: crmAnalyticsDescriptor.workspaceZone,
})
