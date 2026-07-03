export const CRM_COMPANY_LIFECYCLE = Object.freeze({
  stages: Object.freeze(["identified", "qualified", "active", "retention", "archived"]),
  allowedTransitions: Object.freeze({
    identified: Object.freeze(["qualified", "archived"]),
    qualified: Object.freeze(["active", "archived"]),
    active: Object.freeze(["retention", "archived"]),
    retention: Object.freeze(["active", "archived"]),
    archived: Object.freeze([]),
  }),
});
