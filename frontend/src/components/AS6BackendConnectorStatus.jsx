import { getAS6DashboardLiveDataStatus } from "../data/as6DashboardLiveData.js";
import { AS6DataSurface, AS6DataKPI, AS6DataState } from "./AS6UnifiedDataSurface.jsx";

export function AS6BackendConnectorStatus() {
  let status;
  try {
    status = getAS6DashboardLiveDataStatus();
  } catch (error) {
    status = { status: "FALLBACK", source: "AS6_OPERATIONAL_STORE_V104", connectorHealth: { status: "tracked" }, error: error?.message || "AS6_BACKEND_CONNECTOR_STATUS_ERROR" };
  }

  const connectorStatus = status.connectorHealth?.status || "tracked";

  return (
    <AS6DataSurface title="Backend Connector Status">
      <div className="as6-data-kpi-grid">
        <AS6DataKPI label="Connector" value={connectorStatus} detail={status.source || "AS6_OPERATIONAL_STORE_V104"} />
        <AS6DataKPI label="Data" value={status.status || "UNKNOWN"} detail={status.generatedAt || "generated on demand"} />
        <AS6DataKPI label="Widgets" value={status.widgetCount ?? 0} detail="connected signals" />
      </div>
      {status.error && <AS6DataState type="warning" title="Connector fallback active" detail={status.error} />}
    </AS6DataSurface>
  );
}

export function mountAS6BackendConnectorStatus() {
  return <AS6BackendConnectorStatus />;
}

export default AS6BackendConnectorStatus;
