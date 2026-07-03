export const AS6_PANEL_CAPABILITY_CONTRACT = "AS6_PANEL_CAPABILITY_CONTRACT";

export const AS6_PANEL_CAPABILITIES = Object.freeze([
  "diagnostics",
  "assistant",
  "notifications",
  "activity",
  "insights",
  "tools",
]);

export function createPanelCapability(capability = {}) {
  if (!capability.id || !capability.label) {
    throw new Error("AS6_PANEL_CAPABILITY_CONTRACT_INVALID");
  }
  return {
    id: String(capability.id),
    label: String(capability.label),
    description: capability.description ? String(capability.description) : "",
    scope: capability.scope ? String(capability.scope) : "workspace.panel",
  };
}

export function normalizePanelCapabilities(capabilities = []) {
  return Array.isArray(capabilities) ? capabilities.map(String) : [];
}

export function validatePanelCapabilities(capabilities = []) {
  const values = normalizePanelCapabilities(capabilities);
  return values.every((capability) => AS6_PANEL_CAPABILITIES.includes(capability));
}
