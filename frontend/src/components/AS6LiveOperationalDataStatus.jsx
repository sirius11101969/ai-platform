import { createAS6DashboardLiveSnapshot, getAS6DashboardLiveDataStatus } from "../data/as6DashboardLiveData.js";
import { AS6DataSurface, AS6DataKPI, AS6DataState } from "./AS6UnifiedDataSurface.jsx";

export function AS6LiveOperationalDataStatus() {
  let status;
  let snapshot;
  try {
    status = getAS6DashboardLiveDataStatus();
    snapshot = createAS6DashboardLiveSnapshot();
  } catch (error) {
    status = { status: "FALLBACK", source: "AS6_OPERATIONAL_STORE_V104", widgetCount: 0, error: error?.message || "AS6_LIVE_OPERATIONAL_DATA_STATUS_ERROR" };
    snapshot = { generatedAt: null, freshness: "fallback", widgets: {}, connectorHealth: { status: "tracked" } };
  }

  return (
    <AS6DataSurface title="Live Operational Data">
      <div className="as6-data-kpi-grid">
        <AS6DataKPI label="Status" value={status.status || "UNKNOWN"} detail={status.source || "AS6_OPERATIONAL_STORE_V104"} />
        <AS6DataKPI label="Freshness" value={snapshot.freshness || "unknown"} detail={snapshot.generatedAt || status.generatedAt || "generated on demand"} />
        <AS6DataKPI label="Signals" value={Object.keys(snapshot.widgets || {}).length} detail="operational widgets" />
        <AS6DataKPI label="Connector" value={status.connectorHealth?.status || snapshot.connectorHealth?.status || "tracked"} detail="health signal" />
      </div>
      {status.error && <AS6DataState type="warning" title="Operational data fallback active" detail={status.error} />}
    </AS6DataSurface>
  );
}

export function mountAS6LiveOperationalDataStatus() {
  return <AS6LiveOperationalDataStatus />;
}

export default AS6LiveOperationalDataStatus;
