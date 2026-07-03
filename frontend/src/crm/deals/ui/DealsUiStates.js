export const CRM_DEALS_UI_STATES = Object.freeze(["loading", "empty", "ready", "error"]);

export function resolveCrmDealsUiState({ loading = false, error = null, deals = [] } = {}) {
  if (loading) return "loading";
  if (error) return "error";
  if (!deals.length) return "empty";
  return "ready";
}
