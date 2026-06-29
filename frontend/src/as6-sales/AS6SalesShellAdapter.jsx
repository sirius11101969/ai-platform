import { AS6Shell } from '../as6/shell/AS6Shell';
import CRMWorkspacePage from '../pages/CRMWorkspacePage';
import { AS6CrmRuntimeStatus, useAS6CrmRuntimeBridge } from "../as6/spaces/crm/AS6CrmRuntimeBridge";

export default function AS6SalesShellAdapter() {
  const crmRuntime = useAS6CrmRuntimeBridge({ currentView: "sales-shell" });
  return (
    <AS6Shell
      spaceId="as6-sales"
      spaceName="AS6 Sales"
      livingSpaceTarget="/as6-sales"
      contextBarMode="adaptive"
      intelligenceRailMode="adaptive"
    >
      <AS6CrmRuntimeStatus state={crmRuntime} />
      <CRMWorkspacePage />
    </AS6Shell>
  );
}
