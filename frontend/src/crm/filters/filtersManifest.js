import { crmFiltersContract } from './filtersContract.js'
import { crmFiltersDescriptor } from './filtersDescriptor.js'
import { crmFiltersCapabilities } from './filtersCapabilities.js'

export const crmFiltersManifest = Object.freeze({
  id: 'crm.filters.manifest',
  domain: crmFiltersContract.domain,
  entity: crmFiltersContract.entity,
  descriptor: crmFiltersDescriptor,
  contract: crmFiltersContract,
  capabilities: crmFiltersCapabilities,
  diagnostics: Object.freeze([
    'AS6_CRM_FILTERS_FOUNDATION_PRESENT',
    'AS6_CRM_FILTERS_CONTRACT_REGISTERED',
    'AS6_CRM_FILTERS_RUNTIME_TRACEABLE',
  ]),
})
