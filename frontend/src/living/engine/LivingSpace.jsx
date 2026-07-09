import React, { useMemo } from "react";
import AS6Core from "../core/AS6Core.jsx";
import { LivingNode, defaultLivingNodes } from "../nodes/LivingNode.jsx";
import { as6CoreColors } from "../tokens/colors.js";
import { getAS6LivingState } from "../states/livingStates.js";
import { resolveLivingPhysics } from "./PhysicsEngine.js";
import "../core/AS6Core.css";
import "../nodes/LivingNode.css";
import "./LivingSpace.css";

export function LivingSpace({ stateId = "living", nodes = defaultLivingNodes }) {
  const state = getAS6LivingState(stateId);
  const colors = as6CoreColors[state.coreMode] || as6CoreColors.living;
  const activeNodeIds = new Set(state.activeNodeIds || []);
  const physics = useMemo(() => resolveLivingPhysics({ state, nodes }), [state, nodes]);

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
        <div className="living-space__connections" data-connection-count={physics.connections.length} />
        {nodes.map((node) => {
          const position = physics.layoutMap[node.id];
          const energy = physics.energyMap[node.id] || 0;
          const attention = physics.attentionMap[node.id] || 0;

          return (
            <div
              key={node.id}
              style={{
                left: position.left,
                top: position.top,
                "--node-energy": energy,
                "--node-attention": attention,
              }}
              className="living-space__node-slot"
            >
              <LivingNode node={node} active={activeNodeIds.has(node.id)} energy={energy} attention={attention} />
            </div>
          );
        })}
        <AS6Core state={state} />
      </section>
    </main>
  );
}

export default LivingSpace;
