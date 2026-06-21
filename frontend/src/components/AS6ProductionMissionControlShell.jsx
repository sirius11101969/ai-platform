import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "../styles/as6-production-mission-control-shell.css";

const nav = [
  ["🚀", "Command Center", "/command-center"],
  ["▣", "Дашборд", "/dashboard"],
  ["▧", "CRM-воронка", "/crm"],
  ["↗", "Выручка", "/revenue"],
  ["👥", "AI сотрудники", "/ai-workforce-center"],
  ["☑", "AI задачи", "/ai-execution-center"],
  ["⌁", "AI аналитика", "/ai-executive-brain"],
  ["✉", "AI коммуникации", "/ai-approval-center"],
  ["⚙", "AI настройки", "/settings"]
];

function AS6ProductionMissionControlShell() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const isCommandCenter = path.includes("command-center");

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.add("as6-production-brand-shell");
    document.body.classList.toggle("as6-production-brand-shell-active", !isCommandCenter);
  }, [isCommandCenter]);

  if (isCommandCenter) return null;

  return (
    <div className="as6-prod-shell" data-as6-production-shell="v114c">
      <aside className="as6-prod-sidebar">
        <a className="as6-prod-logo" href="/command-center">
          <b>AS6</b>
          <span>AI PLATFORM</span>
        </a>
        <nav className="as6-prod-nav">
          {nav.map(([icon, label, href]) => <a key={href} className={path.startsWith(href) ? "active" : ""} href={href}><i>{icon}</i><span>{label}</span></a>)}
        </nav>
        <div className="as6-prod-owner"><strong>Владимир</strong><small>Owner · Online</small></div>
      </aside>
      <header className="as6-prod-header">
        <section>
          <h1>Добро пожаловать, <em>Владимир!</em> 👋</h1>
          <p>Ваш AI Command Center. Управляйте, анализируйте и масштабируйте выручку.</p>
          <div><b>● Live-ready</b><b>● API подключён</b><b>● AS6 Mission Control</b></div>
        </section>
        <section className="as6-prod-actions"><input placeholder="⌕ Поиск..." /><button>🔔</button><button>?</button><button>A</button></section>
      </header>
    </div>
  );
}

function mountAS6ProductionMissionControlShell() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-production-mission-control-shell-root")) return;
  const root = document.createElement("div");
  root.id = "as6-production-mission-control-shell-root";
  document.body.prepend(root);
  createRoot(root).render(<AS6ProductionMissionControlShell />);
}

mountAS6ProductionMissionControlShell();

export default AS6ProductionMissionControlShell;
