import { crmActivityManifest } from "./crmActivityManifest";
import { crmActivityRegistry } from "./crmActivityRegistry";
import { getCrmActivityHealthSnapshot } from "./crmActivityHealthSnapshot";

export const crmActivityFoundationDescriptor = Object.freeze({
  id: "crm.activities.tasks.foundation",
  title: crmActivityManifest.title,
  module: crmActivityManifest.module,
  registry: crmActivityRegistry,
  health: getCrmActivityHealthSnapshot,
});
