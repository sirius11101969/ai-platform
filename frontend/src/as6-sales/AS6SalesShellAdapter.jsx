import { AS6Shell } from '../as6/shell/AS6Shell';
import CRMWorkspacePage from '../pages/CRMWorkspacePage';

export default function AS6SalesShellAdapter() {
  return (
    <AS6Shell
      spaceId="as6-sales"
      spaceName="AS6 Sales"
      livingSpaceTarget="/as6-sales"
      contextBarMode="adaptive"
      intelligenceRailMode="adaptive"
    >
      <CRMWorkspacePage />
    </AS6Shell>
  );
}
