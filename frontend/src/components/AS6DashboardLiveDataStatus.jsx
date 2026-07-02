import { getAS6DashboardLiveDataStatus } from "../data/as6DashboardLiveData.js";
import { AS6DataSurface, AS6DataKPI, AS6DataState } from "./AS6UnifiedDataSurface.jsx";

export function AS6DashboardLiveDataStatus() {
  let status;
  try {
    status = getAS6DashboardLiveDataStatus();
  } catch (error) {
    status = { status: "FALLBACK", source: "dashboard-live-data", widgetCount: 0, error: error?.message || "AS6_DASHBOARD_LIVE_DATA_STATUS_ERROR" };
  }

  return (
    <AS6DataSurface title="Dashboard Live Data">
      <div className="as6-data-kpi-grid">
        <AS6DataKPI label="Status" value={status.status || "UNKNOWN"} detail={status.source || "AS6_DASHBOARD_LIVE_DATA_V105"} />
        <AS6DataKPI label="Widgets" value={status.widgetCount ?? 0} detail="dashboard widgets" />
        <AS6DataKPI label="Connector" value={status.connectorHealth?.status || "tracked"} detail={status.generatedAt || "generated on demand"} />
      </div>
      {status.error && <AS6DataState type="warning" title="Dashboard fallback active" detail={status.error} />}
    </AS6DataSurface>
  );
}

export function mountAS6DashboardLiveDataStatus() {
  return <AS6DashboardLiveDataStatus />;
}

export default AS6DashboardLiveDataStatus;
