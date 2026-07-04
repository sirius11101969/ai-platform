export const CRM_DEALS_WORKSPACE_STATES = Object.freeze(["loading", "empty", "ready", "error"]);

export function resolveCrmDealsWorkspaceState(snapshot) {
  if (!snapshot) return "loading";
  if (snapshot.diagnostic?.status !== "PASS") return "error";
  return "ready";
}
