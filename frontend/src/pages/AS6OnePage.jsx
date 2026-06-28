import React, { useEffect } from "react";
import "../styles/as6-one-page.css";

const navItems = [
  "Command Center",
  "CRM Enterprise",
  "AS6 Сотрудники",
  "AS6 Автоматизация",
  "Revenue Brain",
  "Pipeline Copilot",
];

const commandItems = [
  "Следующий лучший шаг",
  "Приоритизировать сделки",
  "Запустить follow-up",
  "Синхронизировать команду",
];

const employeeCards = [
  ["AS6 SDR", "18 лидов", "готовит outreach"],
  ["AS6 Analyst", "+12% forecast", "обновляет прогноз"],
  ["AS6 Operator", "7 задач", "держит SLA"],
];

export default function AS6OnePage() {
  useEffect(() => {
    document.body.classList.add("as6-one-fullscreen-route");
    document.documentElement.dataset.as6OneRoute = "fullscreen";

    return () => {
      document.body.classList.remove("as6-one-fullscreen-route");
      delete document.documentElement.dataset.as6OneRoute;
    };
  }, []);

  return (
    <main className="as6-one-page" data-as6-one-page="production" data-production-marker="as6-one-fullscreen-route">
      <aside className="as6-one-sidebar" aria-label="AS6 One navigation">
        <div className="as6-one-brand">
          <span className="as6-one-brand-mark">AS6</span>
          <div>
            <strong>AS6 ONE</strong>
            <small>Enterprise cockpit</small>
          </div>
        </div>

        <nav className="as6-one-nav">
          {navItems.map((item) => (
            <a key={item} href="#workspace" className={item === "CRM Enterprise" ? "active" : ""}>{item}</a>
          ))}
        </nav>

        <div className="as6-one-sidebar-card">
          <span>AS6 работает</span>
          <strong>24/7</strong>
          <p>Автономные контуры продаж, CRM и revenue operations активны.</p>
        </div>
      </aside>

      <section className="as6-one-workspace" id="workspace">
        <header className="as6-one-topbar">
          <div>
            <span className="as6-one-eyebrow">Fullscreen preview</span>
            <h1>AS6 ONE Command Workspace</h1>
          </div>
          <div className="as6-one-topbar-actions">
            <button type="button">Live mode</button>
            <button type="button">Share</button>
          </div>
        </header>

        <section className="as6-one-command-bar" aria-label="AS6 command bar">
          <strong>AS6 Помощник</strong>
          <div>
            {commandItems.map((item) => <button key={item} type="button">{item}</button>)}
          </div>
        </section>

        <section className="as6-one-hero">
          <div>
            <span className="as6-one-eyebrow">CRM Enterprise / AS6 ONE</span>
            <h2>Единая автономная страница без старого AppShell</h2>
            <p>AS6OnePage сам содержит sidebar, topbar, command bar, right rail и footer для полноэкранного preview.</p>
          </div>
          <div className="as6-one-hero-metric">
            <span>AS6 Автоматизация</span>
            <strong>93%</strong>
            <small>операций закрыты без ручного переключения контекста</small>
          </div>
        </section>

        <section className="as6-one-grid">
          {employeeCards.map(([title, value, text]) => (
            <article key={title} className="as6-one-card">
              <span>AS6 Сотрудники</span>
              <strong>{title}</strong>
              <b>{value}</b>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <footer className="as6-one-footer">
          <span>AS6 ONE production preview</span>
          <span>Old CRM routes remain unchanged</span>
        </footer>
      </section>

      <aside className="as6-one-right-rail" aria-label="AS6 One right rail">
        <section>
          <span>Health</span>
          <strong>All systems ready</strong>
          <p>AS6 работает: signals, automations and assistant are available.</p>
        </section>
        <section>
          <span>Next action</span>
          <strong>Review top 12 deals</strong>
          <button type="button">Open queue</button>
        </section>
      </aside>
    </main>
  );
}
