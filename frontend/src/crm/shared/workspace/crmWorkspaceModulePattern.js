export const CRM_WORKSPACE_MODULE_PATTERN = Object.freeze({
  id: "crm.workspace.module.pattern",
  requiredStates: Object.freeze(["loading", "empty", "ready", "error"]),
  invariants: Object.freeze({
    USE_EXISTING_CRM_WORKSPACE: true,
    USE_EXISTING_CRM_LAYOUT: true,
    NO_PARALLEL_SHELL: true,
    NO_STORAGE: true,
    NO_API_CALLS: true,
    NO_BUSINESS_WORKFLOW: true,
  }),
});
