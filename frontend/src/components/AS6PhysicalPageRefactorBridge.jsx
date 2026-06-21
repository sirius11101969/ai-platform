import React from "react";
import { AS6RealPageConversionEngine } from "./AS6RealPageConversionEngine.jsx";
import { AS6DataSurface, AS6DataKPI, AS6DataActionBar, AS6DataState } from "./AS6UnifiedDataSurface.jsx";
import "../styles/as6-physical-page-refactor-migration.css";

export const AS6_PHYSICAL_PAGE_REFACTOR_MIGRATION_V109 = {
  status: "ENABLED",
  conversion: "100%",
  primitives: ["Hero", "KPI", "FilterBar", "TableShell", "ActionBar", "EmptyState", "LoadingState", "ErrorState"],
  pages: ["CRM", "Dashboard", "Revenue", "Workforce", "Approval", "Execution", "ExecutiveBrain"]
};

export function AS6PhysicalPageRefactorBridge({ title, subtitle, metrics = [], children, actions }) {
  return (
    <AS6RealPageConversionEngine title={title} subtitle={subtitle} metrics={metrics} actions={actions}>
      <AS6DataSurface title="Physical Refactor Surface">
        {children || <AS6DataState type="empty" title="Physical refactor active" detail="Legacy layout is governed by AS6 physical refactor bridge." />}
      </AS6DataSurface>
    </AS6RealPageConversionEngine>
  );
}

export function AS6PhysicalKpiRow({ items = [] }) {
  return <section className="as6-physical-kpi-row">{items.map((item) => <AS6DataKPI key={item.label} {...item} />)}</section>;
}

export function AS6PhysicalActionBar({ children }) {
  return <AS6DataActionBar>{children}</AS6DataActionBar>;
}

export default AS6PhysicalPageRefactorBridge;
