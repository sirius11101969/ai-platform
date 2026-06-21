import React, { useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import "../styles/as6-real-mission-control-shell-rollout.css";

const AS6_NAV = [
  { label: "🚀 Command Center", href: "/command-center" },
  { label: "▣ Dashboard", href: "/dashboard" },
  { label: "▧ CRM", href: "/crm" },
  { label: "↗ Revenue", href: "/revenue" },
  { label: "👥 AI сотрудники", href: "/ai-workforce-center" },
  { label: "☑ AI задачи", href: "/ai-execution-center" },
  { label: "⌁ AI аналитика", href: "/ai-executive-brain" },
  { label: "✉ AI коммуникации", href: "/ai-approval-center" },
  { label: "⚙ AI настройки", href: "/settings" }
];

function AS6MissionControlShellAdapter() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const isCommandCenter = path.includes("command-center");
  const active = useMemo(() => AS6_NAV.find((item) => path === item.href || path.startsWith(item.href + "/"))?.href || "/command-center", [path]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("as6-mission-shell-adopted", !isCommandCenter);
    document.body.classList.add("as6-brand-shell-v114");
    return () => document.body.classList.remove("as6-mission-shell-adopted");
  }, [isCommandCenter]);

  if (isCommandCenter) return null;

  return (
    <div className="as6-shell-v114" data-as6-real-shell="v114">
      <aside className="as6-shell-v114-sidebar" aria-label="AS6 Mission Control Navigation">
        <a className="as6-shell-v114-logo" href="/command-center" aria-label="AS6 Command Center">
          <span className="as6-shell-v114-logo-mark">AS6</span>
          <small>AI PLATFORM</small>
        </a>
        <nav className="as6-shell-v114-nav">
          {AS6_NAV.map((item) => (
            <a key={item.href} className={active === item.href ? "active" : ""} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <section className="as6-shell-v114-owner">
          <b>AS6 Owner</b>
          <span>Владимир · Онлайн</span>
        </section>
      </aside>
      <header className="as6-shell-v114-header">
        <div>
          <h1>Добро пожаловать, <span>Владимир!</span> 👋</h1>
          <p>Ваш AI Command Center. Управляйте, анализируйте и масштабируйте выручку.</p>
          <div className="as6-shell-v114-status"><b>● Live-ready</b><b>● API подключён</b><b>● Mission Control UI</b></div>
        </div>
        <div className="as6-shell-v114-actions">
          <input aria-label="AS6 Search" placeholder="⌕  Поиск..." />
          <button>🔔</button>
          <button>💬</button>
          <button>?</button>
          <button>A</button>
        </div>
      </header>
    </div>
  );
}

function mountAS6MissionControlShellAdapter() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-mission-control-shell-adapter-root")) return;
  const root = document.createElement("div");
  root.id = "as6-mission-control-shell-adapter-root";
  document.body.appendChild(root);
  createRoot(root).render(<AS6MissionControlShellAdapter />);
}

mountAS6MissionControlShellAdapter();

export default AS6MissionControlShellAdapter;
