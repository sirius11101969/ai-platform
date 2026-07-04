import { diagnoseCrmDealsLiveLayoutMount } from "./crmDealsLiveLayoutMountDiagnostics";
import { traceCrmDealsLiveLayoutMount } from "./crmDealsLiveLayoutMountTracer";

export function getCrmDealsLiveLayoutMountHealthSnapshot() {
  return Object.freeze({
    module: "CRM_DEALS_OPPORTUNITIES",
    readiness: 99,
    diagnostic: diagnoseCrmDealsLiveLayoutMount(),
    trace: traceCrmDealsLiveLayoutMount(),
  });
}
