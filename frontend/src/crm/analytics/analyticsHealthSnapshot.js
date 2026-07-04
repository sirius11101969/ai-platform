import { crmAnalyticsManifest } from './analyticsManifest.js'

export function createCrmAnalyticsHealthSnapshot(overrides = {}) {
  return Object.freeze({
    domain: crmAnalyticsManifest.domain,
    status: 'ready',
    manifestRegistered: true,
    runtimeTraceable: true,
    workspaceReusable: true,
    analyticsInputsDeclared: true,
    generatedAt: new Date().toISOString(),
    ...overrides,
  })
}
