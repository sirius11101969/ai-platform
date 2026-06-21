import React from "react";
import { AS6DataSurface, AS6DataKPI, AS6DataTable, AS6DataActionBar, AS6DataState } from "./AS6UnifiedDataSurface.jsx";
import "../styles/as6-real-component-consolidation.css";

export const AS6_REAL_COMPONENT_CONSOLIDATION_V110 = {
  status: "ENABLED",
  target: "single-source-ui-primitives",
  primitives: ["KPI", "Card", "Table", "Filter", "ActionBar", "EmptyState", "LoadingState", "ErrorState"],
  pages: ["CRM", "Dashboard", "Revenue", "Workforce", "Approval", "Execution", "ExecutiveBrain"]
};

export function AS6UnifiedKPI(props) { return <AS6DataKPI {...props} />; }
export function AS6UnifiedCard({ title, children }) { return <AS6DataSurface title={title}>{children}</AS6DataSurface>; }
export function AS6UnifiedTable({ children }) { return <AS6DataTable>{children}</AS6DataTable>; }
export function AS6UnifiedFilterBar({ children }) { return <section className="as6-unified-filter-bar">{children}</section>; }
export function AS6UnifiedActionBar({ children }) { return <AS6DataActionBar>{children}</AS6DataActionBar>; }
export function AS6UnifiedEmptyState(props) { return <AS6DataState type="empty" {...props} />; }
export function AS6UnifiedLoadingState(props) { return <AS6DataState type="loading" {...props} />; }
export function AS6UnifiedErrorState(props) { return <AS6DataState type="error" {...props} />; }

export default AS6_REAL_COMPONENT_CONSOLIDATION_V110;
