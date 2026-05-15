import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { userProfile, creditSummary } from "../data/mockData";

export function BrandMark() {
  return (
    <Link to="/" className="brand app-brand" aria-label="AI Bot Platform">
      <span>AI</span> Bot Platform
    </Link>
  );
}

export function ProtectedLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar shell-glow">
        <BrandMark />
        <nav className="side-nav" aria-label="Основная навигация">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>Dashboard</NavLink>
          <NavLink to="/crm" className={({ isActive }) => (isActive ? "active" : "")}>CRM pipeline</NavLink>
          <Link to="/login" onClick={() => window.localStorage.removeItem("ai-platform-auth")}>Выйти</Link>
        </nav>
        <CreditsMiniBlock />
      </aside>
      <div className="workspace">
        <header className="workspace-header shell-glow">
          <div>
            <span className="eyebrow">Protected workspace</span>
            <h1>AI Revenue OS</h1>
          </div>
          <div className="profile-pill">
            <strong>{userProfile.name}</strong>
            <span>{userProfile.plan}</span>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

function CreditsMiniBlock() {
  return (
    <section className="credits-mini" aria-label="Баланс credits">
      <span>AI credits</span>
      <strong>{creditSummary.balance.toLocaleString("ru-RU")}</strong>
      <p>{creditSummary.forecast}</p>
    </section>
  );
}

export function PageHeading({ eyebrow, title, copy, action }) {
  return (
    <div className="app-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
      {action}
    </div>
  );
}

export function Panel({ className = "", children }) {
  return <section className={`app-panel shell-glow ${className}`}>{children}</section>;
}

export function StatCard({ label, value, hint, tone = "cyan" }) {
  return (
    <Panel className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{hint}</p>
    </Panel>
  );
}
