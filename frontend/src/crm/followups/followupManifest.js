import { crmFollowupContract } from './followupContract.js'
import { crmFollowupDescriptor } from './followupDescriptor.js'
import { crmFollowupCapabilities } from './followupCapabilities.js'

export const crmFollowupManifest = Object.freeze({
  id: 'crm.followups.manifest',
  domain: crmFollowupContract.domain,
  entity: crmFollowupContract.entity,
  descriptor: crmFollowupDescriptor,
  contract: crmFollowupContract,
  capabilities: crmFollowupCapabilities,
  diagnostics: Object.freeze([
    'AS6_CRM_FOLLOWUPS_FOUNDATION_PRESENT',
    'AS6_CRM_FOLLOWUPS_CONTRACT_REGISTERED',
    'AS6_CRM_FOLLOWUPS_RUNTIME_TRACEABLE',
  ]),
})
