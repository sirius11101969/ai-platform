import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles/as6-global-command-palette.css";

function AS6GlobalCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const commands = useMemo(() => [
    { title: "Command Center", group: "Navigation", hint: "Mission Control", path: "/" },
    { title: "Dashboard", group: "Navigation", hint: "Executive overview", path: "/dashboard" },
    { title: "CRM", group: "Navigation", hint: "Pipeline and customers", path: "/crm" },
    { title: "AI Workforce", group: "Navigation", hint: "Agents and work loops", path: "/ai-workers" },
    { title: "Approval Center", group: "Navigation", hint: "Human approvals", path: "/approval" },
    { title: "Execution Center", group: "Navigation", hint: "Automated execution", path: "/execution" },
    { title: "Executive Brain", group: "Navigation", hint: "AI strategy layer", path: "/executive" },
    { title: "Revenue Dashboard", group: "Navigation", hint: "Revenue intelligence", path: "/revenue" },
    { title: "Run Diagnostics", group: "AS6", hint: "Diagnostics First", path: "/diagnostics" },
    { title: "Open Health", group: "AS6", hint: "Production status", path: "/api/health" },
    { title: "Find Leads", group: "CRM", hint: "Search pipeline", path: "/crm" },
    { title: "Review Approvals", group: "Operations", hint: "Pending decisions", path: "/approval" },
    { title: "Inspect Events", group: "Operations", hint: "Activity stream", path: "/execution" }
  ], []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const isLauncher = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (isLauncher) {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const visible = commands.filter((command) => {
    const text = `${command.title} ${command.group} ${command.hint}`.toLowerCase();
    return text.includes(query.toLowerCase());
  }).slice(0, 9);

  const runCommand = (command) => {
    if (!command) return;
    setOpen(false);
    setQuery("");
    if (command.path) window.location.assign(command.path);
  };

  if (!open) {
    return (
      <button className="as6-command-palette-trigger" type="button" onClick={() => setOpen(true)} aria-label="Open AS6 command palette">
        <span>⌘K</span>
      </button>
    );
  }

  return (
    <div className="as6-command-palette-overlay" role="dialog" aria-modal="true" aria-label="AS6 Command Palette">
      <div className="as6-command-palette-backdrop" onClick={() => setOpen(false)} />
      <div className="as6-command-palette-panel">
        <div className="as6-command-palette-head">
          <div>
            <span className="as6-command-palette-kicker">AS6 Command</span>
            <h2>Что открыть или запустить?</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close command palette">×</button>
        </div>
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="CRM, approvals, diagnostics, revenue..." />
        <div className="as6-command-palette-list">
          {visible.map((command) => (
            <button key={`${command.group}-${command.title}`} type="button" onClick={() => runCommand(command)} className="as6-command-palette-item">
              <span>
                <strong>{command.title}</strong>
                <small>{command.hint}</small>
              </span>
              <em>{command.group}</em>
            </button>
          ))}
          {visible.length === 0 && <div className="as6-command-palette-empty">Ничего не найдено</div>}
        </div>
      </div>
    </div>
  );
}

function mountAS6GlobalCommandPalette() {
  if (typeof document === "undefined") return;
  if (document.getElementById("as6-global-command-palette-root")) return;
  const root = document.createElement("div");
  root.id = "as6-global-command-palette-root";
  document.body.appendChild(root);
  createRoot(root).render(<AS6GlobalCommandPalette />);
}

mountAS6GlobalCommandPalette();

export default AS6GlobalCommandPalette;
