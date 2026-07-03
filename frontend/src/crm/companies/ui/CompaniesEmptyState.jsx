import React from "react";

export function CompaniesEmptyState() {
  return (
    <section className="as6-crm-companies-state" data-as6-companies-empty="true" aria-label="CRM Companies empty state">
      <h3>Компании пока не подключены</h3>
      <p>Фундамент интерфейса готов, но storage, API и бизнес-процессы отключены.</p>
    </section>
  );
}
