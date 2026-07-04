import { CRM_FILTERS_DOMAIN, CRM_FILTERS_ENTITY } from './filtersContract.js'

export const crmFiltersDescriptor = Object.freeze({
  id: CRM_FILTERS_DOMAIN,
  entity: CRM_FILTERS_ENTITY,
  title: 'CRM Filters',
  label: 'Filters',
  description: 'Reusable CRM filtering layer for contacts, companies, deals, activities, followups and analytics inside AS6 Workspace.',
  route: '/crm/filters',
  workspaceZone: 'crm',
  capability: 'crm.filters.manage',
  owner: 'AS6 CRM',
})
