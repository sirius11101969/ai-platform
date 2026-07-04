import { createCrmDealsLayoutModel } from "./crmDealsLayoutModel";

export function resolveCrmDealsLayoutState(snapshotStatus = "PASS") {
  if (snapshotStatus === "LOADING") return "loading";
  if (snapshotStatus === "EMPTY") return "empty";
  if (snapshotStatus !== "PASS") return "error";
  return "ready";
}

export function createCrmDealsLayoutSnapshot() {
  const model = createCrmDealsLayoutModel();

  return Object.freeze({
    id: "crm.deals.layout.snapshot",
    route: model.route,
    activeSection: model.activeSection,
    breadcrumbs: model.breadcrumbs,
    state: resolveCrmDealsLayoutState(model.foundationDiagnostics.diagnostic.status),
    diagnosticStatus: model.foundationDiagnostics.diagnostic.status,
    uiDiagnosticStatus: model.uiDiagnostics.diagnostic.status,
    trace: model.trace,
  });
}
