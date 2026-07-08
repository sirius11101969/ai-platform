import React from "react";

export function LivingNode({ node, active = false }) {
  return (
    <div className={`living-node living-node--${node.kind} ${active ? "living-node--active" : ""}`.trim()}>
      <div className="living-node__shape">
        <span className="living-node__core" />
        <span className="living-node__detail" />
      </div>
      <div className="living-node__label">{node.label}</div>
    </div>
  );
}

export const defaultLivingNodes = [
  { id: "financial-model", label: "Финансовая модель", kind: "finance" },
  { id: "investors", label: "Инвесторы", kind: "orbit" },
  { id: "market", label: "Рынок", kind: "wave" },
  { id: "risks", label: "Риски", kind: "crystal" },
  { id: "team", label: "Команда", kind: "cluster" },
  { id: "strategy", label: "Стратегия", kind: "spiral" },
];

export default LivingNode;
