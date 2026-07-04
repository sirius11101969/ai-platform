import { getCrmAnalyticsManifest } from './analyticsRegistry.js'

export function resolveCrmAnalyticsDomain() {
  const manifest = getCrmAnalyticsManifest()
  if (!manifest) {
    return Object.freeze({
      ok: false,
      code: 'AS6_CRM_ANALYTICS_MANIFEST_MISSING',
      manifest: null,
    })
  }
  return Object.freeze({
    ok: true,
    code: 'AS6_CRM_ANALYTICS_MANIFEST_RESOLVED',
    manifest,
  })
}
