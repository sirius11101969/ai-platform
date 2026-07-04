import { crmFollowupDescriptor } from './followupDescriptor.js'

export const crmFollowupNavigationItem = Object.freeze({
  id: 'crm.followups.nav',
  label: crmFollowupDescriptor.label,
  route: crmFollowupDescriptor.route,
  domain: crmFollowupDescriptor.id,
  workspaceZone: crmFollowupDescriptor.workspaceZone,
})
