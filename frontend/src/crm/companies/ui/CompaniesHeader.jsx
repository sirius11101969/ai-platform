import React from "react";

export function CompaniesHeader({ status = "PASS" }) {
  return (
    <header className="as6-crm-companies-ui__header" aria-label="CRM Companies header" data-as6-companies-header="true">
      <div>
        <p>CRM Companies</p>
        <h2>Компании и аккаунты</h2>
      </div>
      <span aria-label={`Companies foundation status ${status}`}>{status}</span>
    </header>
  );
}
