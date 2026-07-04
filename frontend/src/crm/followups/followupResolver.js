import { getCrmFollowupManifest } from './followupRegistry.js'

export function resolveCrmFollowupDomain() {
  const manifest = getCrmFollowupManifest()
  if (!manifest) {
    return Object.freeze({
      ok: false,
      code: 'AS6_CRM_FOLLOWUPS_MANIFEST_MISSING',
      manifest: null,
    })
  }
  return Object.freeze({
    ok: true,
    code: 'AS6_CRM_FOLLOWUPS_MANIFEST_RESOLVED',
    manifest,
  })
}
