export const crmAnalyticsCapabilities = Object.freeze([
  'crm.analytics.view',
  'crm.analytics.inspect',
  'crm.analytics.trace',
  'crm.analytics.export',
])

export function hasCrmAnalyticsCapability(capability) {
  return crmAnalyticsCapabilities.includes(capability)
}
