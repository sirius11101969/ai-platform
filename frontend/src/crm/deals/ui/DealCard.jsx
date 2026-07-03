import React from "react";

export function DealCard({ deal }) {
  return (
    <article className="as6-crm-deal-card" data-as6-deal-card="true" aria-label={`CRM deal ${deal.title}`}>
      <div>
        <strong>{deal.title}</strong>
        <span>{deal.company}</span>
      </div>
      <div>
        <span>{deal.stage}</span>
        <span>{deal.amount}</span>
      </div>
      <mark>{deal.status}</mark>
    </article>
  );
}
