import React from "react";
import { CompanyCard } from "./CompanyCard";

export function CompaniesList({ companies = [] }) {
  return (
    <main className="as6-crm-companies-ui__list" data-as6-companies-list="true" aria-label="CRM Companies list">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </main>
  );
}
