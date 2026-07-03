export const CRM_COMPANY_STATUSES = Object.freeze({
  prospect: Object.freeze({ id: "prospect", label: "Prospect", active: true }),
  active: Object.freeze({ id: "active", label: "Active", active: true }),
  dormant: Object.freeze({ id: "dormant", label: "Dormant", active: false }),
  archived: Object.freeze({ id: "archived", label: "Archived", active: false }),
});

export const CRM_COMPANY_STATUS_ORDER = Object.freeze(["prospect", "active", "dormant", "archived"]);
