export const CRM_FILTERS_DOMAIN = 'crm.filters'

export const CRM_FILTERS_ENTITY = 'filters'

export const crmFiltersContract = Object.freeze({
  domain: CRM_FILTERS_DOMAIN,
  entity: CRM_FILTERS_ENTITY,
  version: '1.0.0',
  supportedTargets: Object.freeze([
    'contacts',
    'companies',
    'deals',
    'activities',
    'followups',
    'analytics',
  ]),
  filterTypes: Object.freeze([
    'status',
    'owner',
    'priority',
    'date_range',
    'segment',
    'search',
  ]),
  outputs: Object.freeze([
    'query',
    'active_filters',
    'filter_summary',
    'workspace_state',
  ]),
})
