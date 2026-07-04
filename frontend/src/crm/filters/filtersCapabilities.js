export const crmFiltersCapabilities = Object.freeze([
  'crm.filters.view',
  'crm.filters.apply',
  'crm.filters.clear',
  'crm.filters.save',
  'crm.filters.trace',
])

export function hasCrmFiltersCapability(capability) {
  return crmFiltersCapabilities.includes(capability)
}
