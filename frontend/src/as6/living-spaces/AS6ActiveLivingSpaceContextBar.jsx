import { useLocation } from "react-router-dom";
import { getAS6ActiveLivingSpace } from "./as6LivingSpaceEngine";
import "./AS6ActiveLivingSpaceContextBar.css";

export function AS6ActiveLivingSpaceContextBar() {
  const location = useLocation();
  const activeSpace = getAS6ActiveLivingSpace(location.pathname);

  if (!activeSpace) {
    return null;
  }

  return (
    <section className="as6-active-context-bar" aria-label="AS6 active living space context">
      <div className="as6-active-context-bar__main">
        <span className="as6-active-context-bar__eyebrow">Active Space</span>
        <strong className="as6-active-context-bar__title">{activeSpace.name}</strong>
        <span className="as6-active-context-bar__route">{activeSpace.route}</span>
      </div>

      <div className="as6-active-context-bar__meta">
        <span>{activeSpace.contextBarMode || "context"}</span>
        <span>{activeSpace.intelligenceRailMode || "intelligence"}</span>
        <span>{activeSpace.businessLogicPolicy}</span>
      </div>
    </section>
  );
}
