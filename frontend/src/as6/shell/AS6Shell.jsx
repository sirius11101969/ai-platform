import React from "react";

import { AS6LivingSpaceNav } from "../living-spaces/AS6LivingSpaceNav";
import { AS6ActiveLivingSpaceContextBar } from "../living-spaces/AS6ActiveLivingSpaceContextBar";
import { AS6DynamicIntelligenceRail } from "../living-spaces/AS6DynamicIntelligenceRail";
import "./AS6Shell.css";
import { AS6GlobalCommandPalette } from "../commands/AS6GlobalCommandPalette";
export function AS6Shell({
  navigation,
  contextBar,
  workspace,
  intelligenceRail,
  pulse,
  statusBar,
}) {
  return (
    <div className="as6-shell-layout">
      <div className="as6-shell-layout__main">
        <div className="as6-shell" data-as6-shell="foundation">
              <div className="as6-shell-composition__top">
                <AS6GlobalCommandPalette />
        <AS6LivingSpaceNav />
                <AS6ActiveLivingSpaceContextBar />
              </div>
              <div className="as6-shell-composition__rail">
                <AS6DynamicIntelligenceRail />
              </div>
              <aside className="as6-shell__navigation">{navigation}</aside>
              <main className="as6-shell__main">
                <header className="as6-shell__context">{contextBar}</header>
                <section className="as6-shell__workspace">{workspace}</section>
                <footer className="as6-shell__pulse">{pulse}</footer>
              </main>
              <aside className="as6-shell__intelligence">{intelligenceRail}</aside>
              <div className="as6-shell__status">{statusBar}</div>
            </div>
      </div>
    </div>
  );
}