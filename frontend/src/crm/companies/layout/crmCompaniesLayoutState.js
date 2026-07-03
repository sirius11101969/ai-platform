import { createCrmCompaniesLayoutModel } from "./crmCompaniesLayoutModel";

export function resolveCrmCompaniesLayoutState(snapshotStatus = "PASS") {
  if (snapshotStatus === "LOADING") return "loading";
  if (snapshotStatus === "EMPTY") return "empty";
  if (snapshotStatus !== "PASS") return "error";
  return "ready";
}

export function createCrmCompaniesLayoutSnapshot() {
  const model = createCrmCompaniesLayoutModel();

  return Object.freeze({
    id: "crm.companies.layout.snapshot",
    route: model.route,
    activeSection: model.activeSection,
    breadcrumbs: model.breadcrumbs,
    state: resolveCrmCompaniesLayoutState(model.diagnostics.diagnostic.status),
    diagnosticStatus: model.diagnostics.diagnostic.status,
    uiDiagnosticStatus: model.uiDiagnostics.diagnostic.status,
    trace: model.trace,
  });
}
