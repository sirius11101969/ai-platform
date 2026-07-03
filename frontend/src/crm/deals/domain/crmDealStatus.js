export const CRM_DEAL_STATUS = Object.freeze({
  draft: "draft",
  open: "open",
  qualified: "qualified",
  proposal: "proposal",
  negotiation: "negotiation",
  won: "won",
  lost: "lost",
  archived: "archived",
});

export const CRM_DEAL_TERMINAL_STATUSES = Object.freeze([
  CRM_DEAL_STATUS.won,
  CRM_DEAL_STATUS.lost,
  CRM_DEAL_STATUS.archived,
]);
