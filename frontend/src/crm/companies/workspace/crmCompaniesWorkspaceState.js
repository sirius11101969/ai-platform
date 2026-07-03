export const CRM_COMPANIES_WORKSPACE_STATES = Object.freeze(["loading", "empty", "ready", "error"]);

export function resolveCrmCompaniesWorkspaceState(snapshot) {
  if (!snapshot) return "loading";
  if (snapshot.diagnostic?.status !== "PASS") return "error";
  return "ready";
}
