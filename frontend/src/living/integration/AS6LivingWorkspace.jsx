import React from "react";
import LivingSpace from "../engine/LivingSpace.jsx";
import "./AS6LivingWorkspace.css";

export default function AS6LivingWorkspace({ stateId = "living" }) {
  return (
    <section className="as6-living-workspace" aria-label="AS6 Living Workspace">
      <LivingSpace stateId={stateId} />
    </section>
  );
}
