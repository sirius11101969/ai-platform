import { crmActivityCapabilities } from "./crmActivityCapabilities";
import { crmActivityManifest } from "./crmActivityManifest";

export const crmActivityRegistry = Object.freeze({
  key: "crm.activities.tasks",
  module: crmActivityManifest.module,
  manifest: crmActivityManifest,
  capabilities: crmActivityCapabilities,
  version: "0.1.0-foundation",
});
