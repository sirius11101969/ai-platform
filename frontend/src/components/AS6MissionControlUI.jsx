import React from "react";
import "../styles/as6-unified-mission-control-ui.css";

export function AS6MissionPage({ eyebrow = "AS6 Mission Control", title, subtitle, children }) {
  return <main className="as6-mission-page"><section className="as6-mission-hero"><span>{eyebrow}</span><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</section>{children}</main>;
}

export function AS6Card({ children, variant = "default" }) {
  return <section className={`as6-ui-card as6-ui-card-${variant}`}>{children}</section>;
}

export function AS6KPIWidget({ label, value, delta }) {
  return <article className="as6-ui-kpi"><small>{label}</small><strong>{value}</strong>{delta && <span>{delta}</span>}</article>;
}

export function AS6Button({ children, variant = "primary", ...props }) {
  return <button className={`as6-ui-button as6-ui-button-${variant}`} type="button" {...props}>{children}</button>;
}

export function AS6DataGrid({ children }) {
  return <div className="as6-ui-data-grid">{children}</div>;
}

export default { AS6MissionPage, AS6Card, AS6KPIWidget, AS6Button, AS6DataGrid };
