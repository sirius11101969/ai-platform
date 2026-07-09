import React from "react";

export function LivingNode({ node, active = false, energy = 0, attention = 0 }) {
  return (
    <div
      className={`living-node living-node--${node.kind} ${active ? "living-node--active" : ""}`.trim()}
      style={{
        "--living-node-energy": energy,
        "--living-node-attention": attention,
      }}
    >
      <div className="living-node__shape">
        <span className="living-node__core" />
        <span className="living-node__detail" />
      </div>
      <div className="living-node__label">{node.label}</div>
    </div>
  );
}

export const defaultLivingNodes = [
  { id: "financial-model", label: "Финансовая модель", kind: "finance", energyBias: 0.04 },
  { id: "investors", label: "Инвесторы", kind: "orbit", energyBias: 0.02 },
  { id: "market", label: "Рынок", kind: "wave" },
  { id: "risks", label: "Риски", kind: "crystal" },
  { id: "team", label: "Команда", kind: "cluster" },
  { id: "strategy", label: "Стратегия", kind: "spiral", energyBias: 0.03 },
];

export default LivingNode;
