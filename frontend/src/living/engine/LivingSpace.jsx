import React from "react";
import AS6Core from "../core/AS6Core.jsx";
import { LivingNode, defaultLivingNodes } from "../nodes/LivingNode.jsx";
import { as6CoreColors } from "../tokens/colors.js";
import { getAS6LivingState } from "../states/livingStates.js";
import "../core/AS6Core.css";
import "../nodes/LivingNode.css";
import "./LivingSpace.css";

const nodePositions = [
  { left: "16%", top: "18%" },
  { left: "75%", top: "20%" },
  { left: "8%", top: "52%" },
  { left: "79%", top: "54%" },
  { left: "24%", top: "76%" },
  { left: "67%", top: "78%" },
];

export function LivingSpace({ stateId = "living", nodes = defaultLivingNodes }) {
  const state = getAS6LivingState(stateId);
  const colors = as6CoreColors[state.coreMode] || as6CoreColors.living;
  const activeNodeIds = new Set(state.activeNodeIds || []);

  return (
    <main className="living-space" style={{ "--living-accent": colors.secondary }}>
      <div className="living-space__brand">
        <strong>AS6</strong>
        <span>Calm Business</span>
      </div>

      <div className="living-space__capsule" aria-label="Состояние AS6">
        <strong>{state.title}</strong>
        <span>{state.subtitle}</span>
      </div>

      <section className="living-space__stage" aria-label="Живое пространство AS6">
        <div className="living-space__connections" />
        {nodes.map((node, index) => (
          <div key={node.id} style={nodePositions[index % nodePositions.length]} className="living-space__node-slot">
            <LivingNode node={node} active={activeNodeIds.has(node.id)} />
          </div>
        ))}
        <AS6Core state={state} />
      </section>
    </main>
  );
}

export default LivingSpace;
