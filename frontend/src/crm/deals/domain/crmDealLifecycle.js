import { CRM_DEAL_STATUS } from "./crmDealStatus";

export const CRM_DEAL_LIFECYCLE = Object.freeze({
  initial: CRM_DEAL_STATUS.draft,
  active: Object.freeze([
    CRM_DEAL_STATUS.open,
    CRM_DEAL_STATUS.qualified,
    CRM_DEAL_STATUS.proposal,
    CRM_DEAL_STATUS.negotiation,
  ]),
  terminal: Object.freeze([
    CRM_DEAL_STATUS.won,
    CRM_DEAL_STATUS.lost,
    CRM_DEAL_STATUS.archived,
  ]),
});
