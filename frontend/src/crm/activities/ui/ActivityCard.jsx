import React from "react";

export function ActivityCard({ title, type, status, priority }) {
  return (
    <article className="as6-crm-activity-card" aria-label={`${title} activity card`}>
      <div>
        <strong>{title}</strong>
        <p>{type} · {status}</p>
      </div>
      <span>{priority}</span>
    </article>
  );
}
