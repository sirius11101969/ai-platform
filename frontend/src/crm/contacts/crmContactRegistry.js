import { crmContactDescriptor } from "./crmContactDescriptor";
import { crmContactCapabilities } from "./crmContactCapabilities";

export const crmContactRegistry = Object.freeze({
  key: "crm.contacts",
  descriptor: crmContactDescriptor,
  capabilities: crmContactCapabilities,
});
