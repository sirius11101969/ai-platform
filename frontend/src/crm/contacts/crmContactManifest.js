import { crmContactRegistry } from "./crmContactRegistry";

export const crmContactManifest = Object.freeze({
  module: "CRM_CONTACTS",
  foundation: crmContactRegistry.key,
  stage: "AS6_EPIC012_SLICE04_CRM_CONTACTS_FOUNDATION",
  invariants: Object.freeze({
    CRM_CONTACTS_FOUNDATION_ONLY: true,
    NO_STORAGE: true,
    NO_API_CALLS: true,
    NO_BUSINESS_WORKFLOW: true,
    PLATFORM_MUTATION: false,
  }),
});
