import React from "react";
import "../styles/as6-unified-data-surface-system.css";

export function AS6DataSurface({ title, children, actions }) {
  return <section className="as6-data-surface">{title && <header><strong>{title}</strong>{actions}</header>}<div>{children}</div></section>;
}

export function AS6DataKPI({ label, value, detail }) {
  return <article className="as6-data-kpi"><small>{label}</small><strong>{value}</strong>{detail && <span>{detail}</span>}</article>;
}

export function AS6DataTable({ children }) {
  return <div className="as6-data-table">{children}</div>;
}

export function AS6DataActionBar({ children }) {
  return <div className="as6-data-action-bar">{children}</div>;
}

export function AS6DataState({ type = "empty", title, detail }) {
  return <section className={`as6-data-state as6-data-state-${type}`}><strong>{title}</strong>{detail && <p>{detail}</p>}</section>;
}

export const AS6_UNIFIED_DATA_SURFACE_V101 = {
  status: "ENABLED",
  surfaces: ["KPI", "Table", "CRMCard", "Kanban", "Filter", "Form", "Chart", "ActionBar", "Drawer", "Modal", "State"]
};

export default AS6DataSurface;
