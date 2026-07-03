export const CRM_COMPANIES_UI_STATES = Object.freeze(["loading", "empty", "ready", "error"]);

export function resolveCrmCompaniesUiState({ loading = false, error = null, companies = [] } = {}) {
  if (loading) return "loading";
  if (error) return "error";
  if (!companies.length) return "empty";
  return "ready";
}
