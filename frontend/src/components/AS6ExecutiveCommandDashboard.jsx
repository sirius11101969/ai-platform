import { getAS6DashboardLiveDataStatus } from "../data/as6DashboardLiveData.js";
import { getAS6RevenueCrmFusionStatus } from "../data/as6RevenueCrmFusion.js";
import { AS6DataSurface, AS6DataKPI, AS6DataState } from "./AS6UnifiedDataSurface.jsx";

export function AS6ExecutiveCommandDashboard() {
  let dashboard;
  let revenue;
  try {
    dashboard = getAS6DashboardLiveDataStatus();
    revenue = getAS6RevenueCrmFusionStatus();
  } catch (error) {
    dashboard = { status: "FALLBACK", source: "AS6_DASHBOARD_LIVE_DATA_V105", widgetCount: 0, error: error?.message || "AS6_EXECUTIVE_COMMAND_DASHBOARD_ERROR" };
    revenue = { status: "FALLBACK", source: "AS6_REVENUE_CRM_FUSION_V107", feedCount: 0 };
  }

  const hasFallback = dashboard.status === "FALLBACK" || revenue.status === "FALLBACK" || dashboard.error;

  return (
    <AS6DataSurface title="Executive Command Dashboard">
      <div className="as6-data-kpi-grid">
        <AS6DataKPI label="Dashboard" value={dashboard.status || "UNKNOWN"} detail={dashboard.source || "live dashboard"} />
        <AS6DataKPI label="Revenue Fusion" value={revenue.status || "UNKNOWN"} detail={revenue.source || "revenue crm fusion"} />
        <AS6DataKPI label="Signals" value={(dashboard.widgetCount ?? 0) + (revenue.feedCount ?? 0)} detail="executive signals" />
        <AS6DataKPI label="Connector" value={dashboard.connectorHealth?.status || revenue.connectorHealth?.status || "tracked"} detail={dashboard.generatedAt || revenue.generatedAt || "generated on demand"} />
      </div>
      {hasFallback && <AS6DataState type="warning" title="Executive command fallback active" detail={dashboard.error || "One or more executive signals are using fallback data."} />}
    </AS6DataSurface>
  );
}

export function mountAS6ExecutiveCommandDashboard() {
  return <AS6ExecutiveCommandDashboard />;
}

export default AS6ExecutiveCommandDashboard;
