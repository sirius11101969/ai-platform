import { createAS6DashboardLiveSnapshot, getAS6DashboardLiveDataStatus } from "../data/as6DashboardLiveData.js";
import { AS6DataSurface, AS6DataKPI, AS6DataState } from "./AS6UnifiedDataSurface.jsx";

export function AS6GlobalHealthBar() {
  let status;
  let snapshot;
  try {
    status = getAS6DashboardLiveDataStatus();
    snapshot = createAS6DashboardLiveSnapshot();
  } catch (error) {
    status = { status: "FALLBACK", source: "AS6_OPERATIONAL_STORE_V104", widgetCount: 0, error: error?.message || "AS6_GLOBAL_HEALTH_BAR_ERROR" };
    snapshot = { freshness: "fallback", connectorHealth: { status: "tracked" }, widgets: {} };
  }

  const productionHealth = snapshot.widgets?.productionHealth || {};

  return (
    <AS6DataSurface title="Global Health">
      <div className="as6-data-kpi-grid">
        <AS6DataKPI label="Platform" value={productionHealth.status || status.status || "UNKNOWN"} detail={snapshot.freshness || "operational snapshot"} />
        <AS6DataKPI label="Connectors" value={status.connectorHealth?.status || snapshot.connectorHealth?.status || "tracked"} detail={status.source || "AS6_OPERATIONAL_STORE_V104"} />
        <AS6DataKPI label="Widgets" value={status.widgetCount ?? Object.keys(snapshot.widgets || {}).length} detail="live widgets" />
      </div>
      {status.error && <AS6DataState type="warning" title="Global Health fallback active" detail={status.error} />}
    </AS6DataSurface>
  );
}

export function mountAS6GlobalHealthBar() {
  return <AS6GlobalHealthBar />;
}

export default AS6GlobalHealthBar;
