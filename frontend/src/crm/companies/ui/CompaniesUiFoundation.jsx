import React from "react";
import { getCrmCompanyHealthSnapshot } from "../foundation";
import { CompaniesHeader } from "./CompaniesHeader";
import { CompaniesActions } from "./CompaniesActions";
import { CompaniesList } from "./CompaniesList";
import { CompaniesEmptyState } from "./CompaniesEmptyState";
import { CompaniesLoadingState } from "./CompaniesLoadingState";
import { CompaniesErrorState } from "./CompaniesErrorState";
import { CompaniesDiagnosticsPanel } from "./CompaniesDiagnosticsPanel";
import { resolveCrmCompaniesUiState } from "./CompaniesUiStates";
import "./companiesUiFoundation.css";

const SAMPLE_COMPANIES = Object.freeze([
  Object.freeze({ id: "company-001", name: "AS6 Client Group", category: "customer", industry: "SaaS", contactsCount: 3, status: "active" }),
  Object.freeze({ id: "company-002", name: "North Star Partners", category: "partner", industry: "Consulting", contactsCount: 2, status: "prospect" }),
]);

export function CompaniesUiFoundation({ companies = SAMPLE_COMPANIES, loading = false, error = null }) {
  const health = getCrmCompanyHealthSnapshot();
  const state = resolveCrmCompaniesUiState({ loading, error, companies });

  return (
    <section className="as6-crm-companies-ui" data-as6-companies-ui="foundation" data-as6-companies-ui-state={state} aria-label="CRM Companies UI foundation">
      <CompaniesHeader status={health.diagnostic.status} />
      <div className="as6-crm-companies-ui__grid">
        <section className="as6-crm-companies-ui__main" aria-label="CRM Companies main area">
          <CompaniesActions />
          {state === "loading" && <CompaniesLoadingState />}
          {state === "error" && <CompaniesErrorState message={error?.message} />}
          {state === "empty" && <CompaniesEmptyState />}
          {state === "ready" && <CompaniesList companies={companies} />}
        </section>
        <CompaniesDiagnosticsPanel />
      </div>
    </section>
  );
}
