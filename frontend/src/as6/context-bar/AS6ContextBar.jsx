import React from "react";

export function AS6ContextBar({ title = "AS6 Living Space", subtitle = "Context First" }) {
  return (
    <div data-as6-context-bar="foundation">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
