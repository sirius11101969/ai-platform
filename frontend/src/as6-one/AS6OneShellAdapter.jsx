import { AS6Shell } from '../as6/shell/AS6Shell';
import AS6OnePage from '../pages/AS6OnePage';

export default function AS6OneShellAdapter() {
  return (
    <AS6Shell
      spaceId="as6-one"
      spaceName="AS6 ONE"
      livingSpaceTarget="/as6-sales"
      contextBarMode="adaptive"
      intelligenceRailMode="adaptive"
    >
      <AS6OnePage />
    </AS6Shell>
  );
}
