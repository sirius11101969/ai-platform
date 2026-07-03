import React from "react";

export function DealsHeader({ status = "PASS" }) {
  return (
    <header className="as6-crm-deals-ui__header" data-as6-deals-header="true" aria-label="CRM Deals header">
      <div>
        <p>CRM Deals / Opportunities</p>
        <h2>Фундамент интерфейса сделок</h2>
      </div>
      <strong>{status}</strong>
    </header>
  );
}
