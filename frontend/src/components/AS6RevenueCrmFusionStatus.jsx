import { getAS6RevenueCrmFusionStatus } from "../data/as6RevenueCrmFusion.js";
import { AS6DataSurface, AS6DataKPI, AS6DataState } from "./AS6UnifiedDataSurface.jsx";

export function AS6RevenueCrmFusionStatus() {
  let status;
  try {
    status = getAS6RevenueCrmFusionStatus();
  } catch (error) {
    status = { status: "FALLBACK", source: "revenue-crm-fusion", feedCount: 0, error: error?.message || "AS6_REVENUE_CRM_FUSION_STATUS_ERROR" };
  }

  return (
    <AS6DataSurface title="Revenue CRM Fusion">
      <div className="as6-data-kpi-grid">
        <AS6DataKPI label="Status" value={status.status || "UNKNOWN"} detail={status.source || "AS6_REVENUE_CRM_FUSION_V107"} />
        <AS6DataKPI label="Feeds" value={status.feedCount ?? 0} detail="fusion feeds" />
        <AS6DataKPI label="Connector" value={status.connectorHealth?.status || "tracked"} detail={status.generatedAt || "generated on demand"} />
      </div>
      {status.error && <AS6DataState type="warning" title="Revenue CRM fallback active" detail={status.error} />}
    </AS6DataSurface>
  );
}

export function mountAS6RevenueCrmFusionStatus() {
  return <AS6RevenueCrmFusionStatus />;
}

export default AS6RevenueCrmFusionStatus;
