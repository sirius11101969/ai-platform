import React from "react";
import { as6CoreColors } from "../tokens/colors.js";

export function AS6Core({ state, className = "" }) {
  const mode = state?.coreMode || "living";
  const colors = as6CoreColors[mode] || as6CoreColors.living;
  const message = state?.message || {};

  return (
    <section
      className={`as6-core ${className}`.trim()}
      style={{
        "--as6-core-primary": colors.primary,
        "--as6-core-secondary": colors.secondary,
        "--as6-core-aura": colors.aura,
      }}
      aria-label="AS6 Core"
    >
      <div className="as6-core__aura" />
      <div className="as6-core__sphere">
        <div className="as6-core__layer as6-core__layer--outer" />
        <div className="as6-core__layer as6-core__layer--middle" />
        <div className="as6-core__layer as6-core__layer--inner" />
        <div className="as6-core__energy as6-core__energy--one" />
        <div className="as6-core__energy as6-core__energy--two" />
        <div className="as6-core__message">
          <strong>{message.title}</strong>
          <span>{message.detail}</span>
          <em>{message.action}</em>
        </div>
      </div>
    </section>
  );
}

export default AS6Core;
