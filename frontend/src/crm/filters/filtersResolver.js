import { getCrmFiltersManifest } from './filtersRegistry.js'

export function resolveCrmFiltersDomain() {
  const manifest = getCrmFiltersManifest()
  if (!manifest) {
    return Object.freeze({
      ok: false,
      code: 'AS6_CRM_FILTERS_MANIFEST_MISSING',
      manifest: null,
    })
  }
  return Object.freeze({
    ok: true,
    code: 'AS6_CRM_FILTERS_MANIFEST_RESOLVED',
    manifest,
  })
}
