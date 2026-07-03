import React from "react";

export function CompaniesErrorState({ message = "Companies UI diagnostic state is not ready." }) {
  return (
    <section className="as6-crm-companies-state as6-crm-companies-state--error" data-as6-companies-error="true" aria-label="CRM Companies error state">
      <h3>Companies UI требует проверки</h3>
      <p>{message}</p>
    </section>
  );
}
