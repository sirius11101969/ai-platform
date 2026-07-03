export const CRM_COMPANY_CONTACT_LINK = Object.freeze({
  relation: "company.contacts",
  sourceEntity: "crm.company",
  targetEntity: "crm.contact",
  mode: "declarative-link-only",
  hardCoupling: false,
  storage: false,
  apiCalls: false,
  businessWorkflow: false,
});
