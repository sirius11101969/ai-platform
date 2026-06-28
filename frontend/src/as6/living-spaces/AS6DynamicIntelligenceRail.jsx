import { useLocation } from "react-router-dom";
import { getAS6ActiveLivingSpace } from "./as6LivingSpaceEngine";
import "./AS6DynamicIntelligenceRail.css";

export function AS6DynamicIntelligenceRail() {
  const location = useLocation();
  const activeSpace = getAS6ActiveLivingSpace(location.pathname);

  if (!activeSpace) {
    return null;
  }

  const assistantMode =
    activeSpace.id === "as6-sales"
      ? "Sales intelligence"
      : activeSpace.id === "as6-one"
        ? "Workspace intelligence"
        : "Adaptive intelligence";

  return (
    <aside className="as6-dynamic-intelligence-rail" aria-label="AS6 Intelligence Rail">
      <div className="as6-dynamic-intelligence-rail__header">
        <span className="as6-dynamic-intelligence-rail__eyebrow">Intelligence Rail</span>
        <strong>{assistantMode}</strong>
      </div>

      <div className="as6-dynamic-intelligence-rail__body">
        <div className="as6-dynamic-intelligence-rail__card">
          <span>Active context</span>
          <strong>{activeSpace.name}</strong>
        </div>

        <div className="as6-dynamic-intelligence-rail__card">
          <span>Policy</span>
          <strong>{activeSpace.businessLogicPolicy}</strong>
        </div>

        <div className="as6-dynamic-intelligence-rail__card">
          <span>Mode</span>
          <strong>{activeSpace.intelligenceRailMode || "adaptive"}</strong>
        </div>
      </div>
    </aside>
  );
}
