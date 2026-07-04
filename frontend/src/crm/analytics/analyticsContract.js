export const CRM_ANALYTICS_DOMAIN = 'crm.analytics'

export const CRM_ANALYTICS_ENTITY = 'analytics'

export const crmAnalyticsContract = Object.freeze({
  domain: CRM_ANALYTICS_DOMAIN,
  entity: CRM_ANALYTICS_ENTITY,
  version: '1.0.0',
  requiredInputs: Object.freeze([
    'contacts',
    'companies',
    'deals',
    'activities',
    'followups',
  ]),
  metrics: Object.freeze([
    'pipeline_health',
    'followup_velocity',
    'activity_completion',
    'deal_momentum',
    'customer_coverage',
  ]),
  outputs: Object.freeze([
    'summary',
    'signals',
    'risks',
    'next_best_actions',
  ]),
})
