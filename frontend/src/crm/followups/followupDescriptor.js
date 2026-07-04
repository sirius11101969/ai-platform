import { CRM_FOLLOWUP_DOMAIN, CRM_FOLLOWUP_ENTITY } from './followupContract.js'

export const crmFollowupDescriptor = Object.freeze({
  id: CRM_FOLLOWUP_DOMAIN,
  entity: CRM_FOLLOWUP_ENTITY,
  title: 'CRM Followups',
  label: 'Followups',
  description: 'Follow-up actions for contacts, companies, deals and activities inside the AS6 CRM workspace.',
  route: '/followups',
  workspaceZone: 'crm',
  capability: 'crm.followups.manage',
  owner: 'AS6 CRM',
})
