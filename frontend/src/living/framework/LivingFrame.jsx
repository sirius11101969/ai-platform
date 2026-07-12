import React from "react";
import { getLivingSpaceDefinition } from "./spaceRegistry.js";
import LivingInput from "./LivingInput.jsx";
import "./livingFramework.css";

export function LivingFrame({
  spaceId = "focus",
  greeting,
  children,
  rightRail,
  reasoning,
  recommendation,
  action,
  inputValue = "",
  onInputChange,
  onInputSubmit,
}) {
  const space = getLivingSpaceDefinition(spaceId);

  return (
    <main className="as6-living-frame" data-space-id={space.id} data-geometry={space.geometry}>
      <header className="as6-living-frame__header">
        <div className="as6-living-frame__brand">
          <strong>AS6</strong>
          <span>Calm Business</span>
        </div>
        <div className="as6-living-frame__greeting">{greeting}</div>
        <div className="as6-living-frame__title">
          <h1>{space.title}</h1>
          <p>{space.subtitle}</p>
        </div>
        <div className="as6-living-frame__system" aria-label="Системное состояние">
          <span>RU</span><span>EN</span><span aria-hidden="true">☼</span><span aria-hidden="true">◔</span>
        </div>
      </header>

      <section className="as6-living-frame__workspace" aria-label={space.subtitle}>
        <div className="as6-living-frame__stage">{children}</div>
        <aside className="as6-living-frame__right-rail">{rightRail}</aside>
      </section>

      <section className="as6-living-frame__reasoning">{reasoning}</section>
      <section className="as6-living-frame__recommendation">
        <div>{recommendation}</div>
        <div className="as6-living-frame__action">{action}</div>
      </section>

      <LivingInput
        placeholder={space.placeholder}
        value={inputValue}
        onChange={onInputChange}
        onSubmit={onInputSubmit}
      />
    </main>
  );
}

export default LivingFrame;
