import { resolveCrmDealFoundation } from "./crmDealResolver";

export function createCrmDealRuntime() {
  const foundation = resolveCrmDealFoundation();

  return Object.freeze({
    foundation,
    mode: "declarative-foundation-only",
    pipelineMode: "declarative-preview-only",
    companyLink: "declarative-only",
    contactLink: "declarative-only",
    storageEnabled: false,
    apiEnabled: false,
    workflowEnabled: false,
    platformMutation: false,
    ownRouter: false,
    ownStore: false,
  });
}
