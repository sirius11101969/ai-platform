import React from "react";
import "../../styles/as6-workspace.css";

export default function AS6Workspace({
  title = "AS6 Workspace",
  subtitle = "Всегда знает следующий лучший шаг.",
  children,
  rightRail,
}) {
  return (
    <div className="as6-workspace">
      <aside className="as6-sidebar">
        <div className="as6-core">AS6 Core</div>
        <nav className="as6-nav">
          <span>Dashboard</span>
          <span>CRM</span>
          <span>Revenue</span>
          <span>Command Center</span>
        </nav>
      </aside>

      <main className="as6-main">
        <header className="as6-header">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <button className="as6-primary-button">Спросить AS6</button>
        </header>

        <section className="as6-focus">
          <strong>🎯 AS6 Focus</strong>
          <span>Следующий лучший шаг отображается здесь.</span>
        </section>

        <section className="as6-content">
          {children || <div className="as6-placeholder">AS6 Workspace foundation готов к подключению модулей.</div>}
        </section>
      </main>

      <aside className="as6-right-rail">
        {rightRail || (
          <div className="as6-assistant">
            <strong>AS6 Assistant</strong>
            <p>Контекст, подсказки и действия пользователя будут собраны здесь.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
