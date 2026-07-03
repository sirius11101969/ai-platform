export const CRM_COMPANY_IDENTITY = Object.freeze({
  entity: "crm.company",
  aliases: Object.freeze(["company", "account", "organization"]),
  idPrefix: "company",
  displayNameField: "name",
  requiredFields: Object.freeze(["id", "name", "status", "category"]),
});
