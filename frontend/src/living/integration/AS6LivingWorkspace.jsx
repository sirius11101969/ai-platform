import React, { useState } from "react";
import LivingSpace from "../engine/LivingSpace.jsx";
import LivingStateSwitcher from "../states/LivingStateSwitcher.jsx";
import "./AS6LivingWorkspace.css";

export default function AS6LivingWorkspace({ stateId = "living" }) {
  const [activeStateId, setActiveStateId] = useState(stateId);

  return (
    <section className="as6-living-workspace" aria-label="AS6 Living Workspace">
      <LivingSpace stateId={activeStateId} />
      <div className="as6-living-workspace__switcher">
        <LivingStateSwitcher value={activeStateId} onChange={setActiveStateId} />
      </div>
    </section>
  );
}
