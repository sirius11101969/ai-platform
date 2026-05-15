import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { creditSummary, userProfile } from "../data/mockData";
import { clearAuthSession, fetchProfile } from "../services/api";

export function BrandMark() {
  return (
    <Link to="/" className="brand app-brand" aria-label="AI Bot Platform">
      <span>AI</span> Bot Platform
    </Link>
  );
}

export function ProtectedLayout() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    fetchProfile()
      .then((response) => {
        if (active) setProfile(response.user || null);
      })
      .catch(() => {
        if (active) setProfile(null);
      });

    function handleProfileUpdate(event) {
      setProfile((currentProfile) => ({ ...(currentProfile || {}), ...(event.detail || {}) }));
    }

    window.addEventListener("ai-platform-profile-updated", handleProfileUpdate);
    return () => {
      active = false;
      window.removeEventListener("ai-platform-profile-updated", handleProfileUpdate);
    };
  }, []);

  function handleLogout(event) {
    event.preventDefault();
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  const displayName = profile?.email || userProfile.name;
  const displayPlan = profile?.plan || userProfile.plan;

  return (
    <div className="app-shell">
      <aside className="sidebar shell-glow">
        <BrandMark />
        <nav className="side-nav" aria-label="Основная навигация">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>Dashboard</NavLink>
          <NavLink to="/crm" className={({ isActive }) => (isActive ? "active" : "")}>CRM pipeline</NavLink>
          <Link to="/login" onClick={handleLogout}>Выйти</Link>
        </nav>
        <CreditsMiniBlock credits={profile?.credits} />
      </aside>
      <div className="workspace">
        <header className="workspace-header shell-glow">
          <div>
            <span className="eyebrow">Protected workspace</span>
            <h1>AI Revenue OS</h1>
          </div>
          <div className="profile-pill">
            <strong>{displayName}</strong>
            <span>{displayPlan}</span>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

function CreditsMiniBlock({ credits }) {
  const balance = Number.isFinite(Number(credits)) ? Number(credits) : creditSummary.balance;
  return (
    <section className="credits-mini" aria-label="Баланс credits">
      <span>AI credits</span>
      <strong>{balance.toLocaleString("ru-RU")}</strong>
      <p>{Number.isFinite(Number(credits)) ? "Live balance from users table" : creditSummary.forecast}</p>
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
