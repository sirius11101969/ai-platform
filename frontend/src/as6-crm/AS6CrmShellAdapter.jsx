import { AS6Shell } from "../as6/shell/AS6Shell";
import AS6CrmOneWorkspace from "./AS6CrmOneWorkspace";

export default function AS6CrmShellAdapter() {
  return (
    <AS6Shell
      workspace={<AS6CrmOneWorkspace />}
      pulse={<div className="as6-crm-one-pulse">CRM ONE active · legacy rollback: /as6-sales</div>}
      statusBar={<div className="as6-crm-one-statusbar">AS6_CRM_MUST_USE_AS6_ONE_WORKSPACE</div>}
    />
  );
}
