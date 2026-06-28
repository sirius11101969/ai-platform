import React from "react";

export function AS6Shell({
  navigation,
  contextBar,
  workspace,
  intelligenceRail,
  pulse,
  statusBar,
}) {
  return (
    <div className="as6-shell" data-as6-shell="foundation">
      <aside className="as6-shell__navigation">{navigation}</aside>
      <main className="as6-shell__main">
        <header className="as6-shell__context">{contextBar}</header>
        <section className="as6-shell__workspace">{workspace}</section>
        <footer className="as6-shell__pulse">{pulse}</footer>
      </main>
      <aside className="as6-shell__intelligence">{intelligenceRail}</aside>
      <div className="as6-shell__status">{statusBar}</div>
    </div>
  );
}
