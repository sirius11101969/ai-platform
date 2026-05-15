import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { creditSummary, userProfile } from "../data/mockData";
import { clearAuthSession, fetchProfile, getStoredUser } from "../services/api";

export function BrandMark() {
  return (
    <Link to="/" className="brand app-brand" aria-label="AI‑платформа для продаж">
      <span>AI</span> Платформа продаж
    </Link>
  );
}

export function ProtectedLayout({ children }) {
  const [profile, setProfile] = useState(() => getStoredUser());
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    fetchProfile()
      .then((response) => {
        if (active) setProfile(response.user || null);
      })
      .catch((error) => {
        if (!active) return;
        setProfile(null);
        if (error.status === 401) {
          navigate("/login", { replace: true });
        }
      });

    function handleProfileUpdate(event) {
      setProfile((currentProfile) => ({ ...(currentProfile || {}), ...(event.detail || {}) }));
    }

    window.addEventListener("ai-platform-profile-updated", handleProfileUpdate);
    return () => {
      active = false;
      window.removeEventListener("ai-platform-profile-updated", handleProfileUpdate);
    };
  }, [navigate]);

  function openCreateLead() {
    window.sessionStorage?.setItem('crm-open-create-lead', '1');
    navigate('/crm');
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('crm-open-create-lead')), 80);
  }

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
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>Дашборд</NavLink>
          <NavLink to="/crm" className={({ isActive }) => (isActive ? "active" : "")}>CRM‑воронка</NavLink>
          <button className="sidebar-create-lead" type="button" onClick={openCreateLead}>+ Создать лид</button>
          <Link to="/login" onClick={handleLogout}>Выйти</Link>
        </nav>
        <CreditsMiniBlock credits={profile?.credits} />
      </aside>
      <div className="workspace">
        <header className="workspace-header shell-glow">
          <div>
            <span className="eyebrow">Защищённое рабочее пространство</span>
            <h1>AI‑ОС выручки</h1>
          </div>
          <div className="profile-pill">
            <strong>{displayName}</strong>
            <span>{displayPlan}</span>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function CreditsMiniBlock({ credits }) {
  const balance = Number.isFinite(Number(credits)) ? Number(credits) : creditSummary.balance;
  return (
    <section className="credits-mini" aria-label="Баланс AI‑кредитов">
      <span>AI‑кредиты</span>
      <strong>{balance.toLocaleString("ru-RU")}</strong>
      <p>{Number.isFinite(Number(credits)) ? "Живой баланс из профиля пользователя" : creditSummary.forecast}</p>
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

export function Panel({ className = "", children, ...props }) {
  return <section className={`app-panel shell-glow ${className}`} {...props}>{children}</section>;
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
