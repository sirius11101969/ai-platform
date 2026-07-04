import React from "react";

export function TaskCard({ title, status, priority }) {
  return (
    <article className="as6-crm-task-card" aria-label={`${title} task card`}>
      <div>
        <strong>{title}</strong>
        <p>{status}</p>
      </div>
      <span>{priority}</span>
    </article>
  );
}
