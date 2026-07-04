import React from "react";
import { crmActivityFoundationDescriptor } from "../foundation";

export function ActivitiesHeader() {
  return (
    <header className="as6-crm-activities-header" aria-label="CRM Activities header">
      <div>
        <p>CRM / Activities</p>
        <h2>{crmActivityFoundationDescriptor.title}</h2>
      </div>
      <span aria-label="Activities readiness">99%</span>
    </header>
  );
}
