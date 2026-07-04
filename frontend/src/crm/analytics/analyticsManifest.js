import { crmAnalyticsContract } from './analyticsContract.js'
import { crmAnalyticsDescriptor } from './analyticsDescriptor.js'
import { crmAnalyticsCapabilities } from './analyticsCapabilities.js'

export const crmAnalyticsManifest = Object.freeze({
  id: 'crm.analytics.manifest',
  domain: crmAnalyticsContract.domain,
  entity: crmAnalyticsContract.entity,
  descriptor: crmAnalyticsDescriptor,
  contract: crmAnalyticsContract,
  capabilities: crmAnalyticsCapabilities,
  diagnostics: Object.freeze([
    'AS6_CRM_ANALYTICS_FOUNDATION_PRESENT',
    'AS6_CRM_ANALYTICS_CONTRACT_REGISTERED',
    'AS6_CRM_ANALYTICS_RUNTIME_TRACEABLE',
  ]),
})
