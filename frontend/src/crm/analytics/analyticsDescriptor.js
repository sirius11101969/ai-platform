import { CRM_ANALYTICS_DOMAIN, CRM_ANALYTICS_ENTITY } from './analyticsContract.js'

export const crmAnalyticsDescriptor = Object.freeze({
  id: CRM_ANALYTICS_DOMAIN,
  entity: CRM_ANALYTICS_ENTITY,
  title: 'CRM Analytics',
  label: 'Analytics',
  description: 'CRM intelligence layer for pipeline health, follow-up velocity, activity completion and next-best-action signals.',
  route: '/crm/analytics',
  workspaceZone: 'crm',
  capability: 'crm.analytics.view',
  owner: 'AS6 CRM',
})
