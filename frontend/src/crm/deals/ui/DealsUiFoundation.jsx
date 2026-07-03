import React from "react";
import { getCrmDealHealthSnapshot } from "../foundation";
import { resolveCrmDealsUiState } from "./DealsUiStates";
import { traceCrmDealsUi } from "./DealsUiRuntimeTracer";
import { DealsHeader } from "./DealsHeader";
import { DealsActions } from "./DealsActions";
import { DealsList } from "./DealsList";
import { DealsEmptyState } from "./DealsEmptyState";
import { DealsLoadingState } from "./DealsLoadingState";
import { DealsErrorState } from "./DealsErrorState";
import { DealsDiagnosticsPanel } from "./DealsDiagnosticsPanel";
import "./dealsUiFoundation.css";

const SAMPLE_DEALS = Object.freeze([
  Object.freeze({ id: "deal-001", title: "AS6 Platform Launch", company: "AS6 Client", stage: "Proposal", amount: "$24,000", status: "proposal" }),
  Object.freeze({ id: "deal-002", title: "CRM Operating System", company: "AS6 Partner", stage: "Negotiation", amount: "$42,000", status: "negotiation" }),
]);

export function DealsUiFoundation({ deals = SAMPLE_DEALS, loading = false, error = null }) {
  const foundationHealth = getCrmDealHealthSnapshot();
  const trace = traceCrmDealsUi();
  const state = resolveCrmDealsUiState({ loading, error, deals });

  return (
    <section className="as6-crm-deals-ui" data-as6-deals-ui="foundation" data-as6-deals-ui-state={state} aria-label="CRM Deals UI foundation">
      <DealsHeader status={foundationHealth.diagnostic.status} />
      <DealsActions />
      <section className="as6-crm-deals-ui__main" aria-label="CRM Deals main area">
        {state === "loading" && <DealsLoadingState />}
        {state === "error" && <DealsErrorState />}
        {state === "empty" && <DealsEmptyState />}
        {state === "ready" && <DealsList deals={deals} />}
        <DealsDiagnosticsPanel trace={trace} />
      </section>
    </section>
  );
}
