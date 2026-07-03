import { createCrmContactsLayoutModel } from "./crmContactsLayoutModel";

export function resolveCrmContactsLayoutState(snapshotStatus = "PASS") {
  if (snapshotStatus === "LOADING") return "loading";
  if (snapshotStatus === "EMPTY") return "empty";
  if (snapshotStatus !== "PASS") return "error";
  return "ready";
}

export function createCrmContactsLayoutSnapshot() {
  const model = createCrmContactsLayoutModel();
  return Object.freeze({
    id: "crm.contacts.layout.snapshot",
    route: model.route,
    activeSection: model.activeSection,
    breadcrumbs: model.breadcrumbs,
    state: resolveCrmContactsLayoutState(model.diagnostics.diagnostic.status),
    diagnosticStatus: model.diagnostics.diagnostic.status,
  });
}
