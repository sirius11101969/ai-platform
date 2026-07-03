import React from "react";

export function CompanyCard({ company }) {
  return (
    <article className="as6-crm-company-card" data-as6-company-card="true" aria-label={`CRM company ${company.name}`}>
      <div>
        <strong>{company.name}</strong>
        <span>{company.category}</span>
      </div>
      <div>
        <span>{company.industry}</span>
        <span>{company.contactsCount} contacts</span>
      </div>
      <mark aria-label={`Company status ${company.status}`}>{company.status}</mark>
    </article>
  );
}
