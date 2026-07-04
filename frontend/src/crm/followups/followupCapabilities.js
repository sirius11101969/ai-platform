export const crmFollowupCapabilities = Object.freeze([
  'crm.followups.view',
  'crm.followups.create',
  'crm.followups.update',
  'crm.followups.complete',
  'crm.followups.trace',
])

export function hasCrmFollowupCapability(capability) {
  return crmFollowupCapabilities.includes(capability)
}
