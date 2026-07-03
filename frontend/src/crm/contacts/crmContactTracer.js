export function traceCrmContactFoundation(event = "CRM_CONTACT_FOUNDATION_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC012_SLICE04_CRM_CONTACTS_FOUNDATION",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
  });
}
