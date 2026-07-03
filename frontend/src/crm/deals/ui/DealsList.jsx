import React from "react";
import { DealCard } from "./DealCard";

export function DealsList({ deals = [] }) {
  return (
    <main className="as6-crm-deals-ui__list" data-as6-deals-list="true" aria-label="CRM Deals list">
      {deals.map((deal) => <DealCard key={deal.id} deal={deal} />)}
    </main>
  );
}
