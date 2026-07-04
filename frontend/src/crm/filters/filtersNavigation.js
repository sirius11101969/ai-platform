import { crmFiltersDescriptor } from './filtersDescriptor.js'

export const crmFiltersNavigationItem = Object.freeze({
  id: 'crm.filters.nav',
  label: crmFiltersDescriptor.label,
  route: crmFiltersDescriptor.route,
  domain: crmFiltersDescriptor.id,
  workspaceZone: crmFiltersDescriptor.workspaceZone,
})
