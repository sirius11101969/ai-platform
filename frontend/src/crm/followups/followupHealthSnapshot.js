import { crmFollowupManifest } from './followupManifest.js'

export function createCrmFollowupHealthSnapshot(overrides = {}) {
  return Object.freeze({
    domain: crmFollowupManifest.domain,
    status: 'ready',
    manifestRegistered: true,
    runtimeTraceable: true,
    workspaceReusable: true,
    generatedAt: new Date().toISOString(),
    ...overrides,
  })
}
