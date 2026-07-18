import React, { useEffect, useMemo, useState } from "react";
import "./AS6MasterScreen.css";
import "./AS6MasterScreenPolish.css";
import "./AS6MasterScreenReference.css";
import { createLivingShellSnapshot } from "./livingShellFoundation.js";
import { livingIntlLocale } from "./livingLocalization.js";

const graphPoints = [
  [20, 20], [50, 12], [77, 25], [16, 58], [10, 84], [83, 73],
  [14, 40], [12, 70], [34, 89], [55, 87], [86, 48], [67, 17],
];

function NodeGlyph({ type }) {
  if (type === "sales") {
    return <svg viewBox="0 0 64 64"><path d="M32 11l5.7 14.7L53 32l-15.3 6.3L32 53l-5.7-14.7L11 32l15.3-6.3z" /></svg>;
  }
  if (type === "relations") {
    return <svg viewBox="0 0 64 64"><path d="M32 10l18 10v24L32 54 14 44V20z" /><path d="M32 17l12 7v16l-12 7-12-7V24z" /></svg>;
  }
  if (type === "marketing") {
    return <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="7" /><circle cx="32" cy="32" r="18" /><g>{Array.from({ length: 12 }).map((_, index) => <path key={index} d="M32 4v10" transform={`rotate(${index * 30} 32 32)`} />)}</g></svg>;
  }
  if (type === "finance") {
    return <svg viewBox="0 0 64 64"><g>{[18, 32, 46].flatMap((x) => [18, 32, 46].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" />))}</g></svg>;
  }
  if (type === "documents") {
    return <svg viewBox="0 0 64 64"><path d="M15 23l17-10 17 10-17 10z" /><path d="M15 23v18l17 10 17-10V23" /><path d="M15 32l17 10 17-10" /></svg>;
  }
  return <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="8" /><circle cx="32" cy="32" r="18" /><circle cx="32" cy="32" r="25" /></svg>;
}

function MicrophoneGlyph({ listening }) {
  if (listening) {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="6" fill="currentColor" stroke="none" /></svg>;
  }
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="11" y="4" width="10" height="16" rx="5" />
      <path d="M7.5 15.5v1.2a8.5 8.5 0 0 0 17 0v-1.2M16 25.2V29M11.5 29h9" />
    </svg>
  );
}

function formatTime(now, locale) {
  return new Intl.DateTimeFormat(livingIntlLocale(locale), { hour: "2-digit", minute: "2-digit" }).format(now);
}

function formatDate(now, locale) {
  return new Intl.DateTimeFormat(livingIntlLocale(locale), { day: "numeric", month: "short" }).format(now);
}

export default function AS6MasterScreen({
  navigate,
  profileName = "Владимир",
  snapshot,
  onLocaleChange,
  onWorkspaceChange,
}) {
  const shell = snapshot || createLivingShellSnapshot({
    locale: "ru",
    user: { displayName: profileName },
    fallbackProfileName: profileName,
    dataStatus: "ready",
  });
  const { t, identity, priority } = shell;
  const [intent, setIntent] = useState(priority.intent);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [activeSpace, setActiveSpace] = useState(null);
  const [calmMode, setCalmMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setIntent(priority.intent);
  }, [shell.snapshotId, priority.intent]);

  const time = useMemo(() => formatTime(now, shell.locale), [now, shell.locale]);
  const date = useMemo(() => formatDate(now, shell.locale), [now, shell.locale]);
  const activeSpaceData = shell.spaces.find((space) => space.id === activeSpace);

  function submitIntent(event) {
    event.preventDefault();
    if (!intent.trim()) return;
    navigate?.("conductor", { intent: intent.trim(), priorityId: priority.id });
  }

  function chooseWorkspace(workspaceId) {
    setWorkspaceOpen(false);
    onWorkspaceChange?.(workspaceId);
  }

  return (
    <section
      className={`as6-master${calmMode ? " is-calm" : ""}${listening ? " is-listening" : ""}`}
      aria-label={`AS6 — ${t("today")}`}
      data-shell-version={shell.version}
      data-shell-snapshot={shell.snapshotId}
      data-data-state={shell.dataState.status}
    >
      <div className="as6-master__ambient" aria-hidden="true" />
      <p className="as6-master__sr-only" aria-live="polite">{shell.dataState.message}</p>

      <div className="as6-master__canvas">
        <header className="as6-master__topbar">
          <div className="as6-master__today">
            <h1>{t("today")}</h1>
            <p className="as6-master__overnight">{t("overnight", { count: shell.actionCount })}</p>
          </div>
          <div className="as6-master__utilities" aria-label={t("utilities")}>
            {["ru", "en"].map((locale) => (
              <button
                key={locale}
                type="button"
                className={`as6-master__locale${shell.locale === locale ? " is-active" : ""}`}
                onClick={() => onLocaleChange?.(locale)}
                aria-pressed={shell.locale === locale}
                lang={locale}
              >
                {locale.toUpperCase()}
              </button>
            ))}
            <button type="button" aria-label={t("lightTheme")}>☼</button>
            <button type="button" aria-label={t("calmMode")} aria-pressed={calmMode} onClick={() => setCalmMode((value) => !value)}>☾</button>
            <button type="button" aria-label={t("settings")} onClick={() => navigate?.("settings")}>⚙</button>
            <time dateTime={now.toISOString()}><strong>{time}</strong><small>{date}</small></time>
            <button type="button" aria-label={t("weather")}>☼</button><span>24°</span>
          </div>
        </header>

        <main className="as6-master__space">
          <svg className="as6-master__graph" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <filter id="as6-soft-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="0.55" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <g className="as6-master__graph-lines">
              {shell.connections.map((connection) => {
                const related = activeSpace && (connection.from === activeSpace || connection.to === activeSpace);
                const muted = activeSpace && !related;
                return <path key={connection.id} className={`is-${connection.kind}${related ? " is-related" : ""}${muted ? " is-muted" : ""}`} d={connection.d} />;
              })}
            </g>
            <g className="as6-master__graph-points">{graphPoints.map(([cx, cy], index) => <circle key={`${cx}-${cy}-${index}`} cx={cx} cy={cy} r={index < 6 ? 0.48 : 0.30} />)}</g>
          </svg>

          {shell.spaces.map((space) => {
            const isActive = activeSpace === space.id;
            const isMuted = activeSpace && !isActive;
            return (
              <button
                key={space.id}
                type="button"
                className={`as6-master__node as6-master__node--${space.id}${isActive ? " is-active" : ""}${isMuted ? " is-muted" : ""}`}
                style={{ left: `${space.x}%`, top: `${space.y}%` }}
                onMouseEnter={() => setActiveSpace(space.id)}
                onMouseLeave={() => setActiveSpace(null)}
                onFocus={() => setActiveSpace(space.id)}
                onBlur={() => setActiveSpace(null)}
                onClick={() => navigate?.(space.id)}
                aria-label={`${space.label}. ${space.note}`}
              >
                <span className="as6-master__node-mark" aria-hidden="true"><NodeGlyph type={space.id} /></span>
                <strong>{space.label}</strong><small>{space.note}</small>
              </button>
            );
          })}

          <article className="as6-master__focus" key={priority.id}>
            <span className="as6-master__focus-kicker">{t("mainGoal")}</span>
            <h2>{priority.title}</h2>
            <div className="as6-master__thinking" aria-live="polite">
              <span className="as6-master__thinking-dot" aria-hidden="true" />
              <div><small>{t("as6Now")}</small><strong>{priority.activity}</strong></div>
            </div>
            <div className="as6-master__outcome">
              <span>{priority.metricLabel}</span>
              <strong>{priority.metricValue}</strong>
              <small>{priority.metricDelta}</small>
            </div>
          </article>
          <p className="as6-master__space-status" aria-live="polite">{activeSpaceData ? `${activeSpaceData.label}: ${activeSpaceData.note}` : priority.chain}</p>
        </main>

        <aside className="as6-master__identity">
          <button
            type="button"
            className={`as6-master__logo${identity.showCompanyLogo ? " is-company" : ""}`}
            onClick={() => navigate?.("home")}
            aria-label={identity.showCompanyLogo ? identity.workspaceName : t("platformBrand")}
          >
            {identity.showCompanyLogo
              ? <img className="as6-master__logo-image" src={identity.companyLogoUrl} alt={identity.workspaceName} />
              : <><span>AS6</span><small>AI PLATFORM</small></>}
          </button>
          <button
            type="button"
            className="as6-master__workspace"
            onClick={() => setWorkspaceOpen((value) => !value)}
            aria-expanded={workspaceOpen}
            aria-label={t("switchWorkspace")}
          >
            <b>{identity.workspaceName}</b> <span>⌄</span>
          </button>
          {workspaceOpen && (
            <div className="as6-master__workspace-menu">
              {shell.workspaces.map((workspace) => (
                <button
                  type="button"
                  key={workspace.id}
                  className={workspace.id === shell.workspace?.id ? "is-current" : ""}
                  onClick={() => chooseWorkspace(workspace.id)}
                  disabled={workspace.id === shell.workspace?.id}
                >
                  {workspace.name}
                </button>
              ))}
              <button type="button" className="as6-master__workspace-settings" onClick={() => navigate?.("settings")}>{t("settings")}</button>
            </div>
          )}

          <div className="as6-master__greeting">
            <strong>{t("greeting", { name: identity.displayName })}</strong>
            <span>{t("dayReady")}</span>
          </div>
          <div className="as6-master__avatar" aria-label={`Profile: ${identity.displayName}`}>
            <span>{identity.avatarUrl ? <img src={identity.avatarUrl} alt="" /> : identity.initial}</span>
          </div>

          <section className="as6-master__ready">
            <h2>{t("prepared")}</h2>
            <ul>{priority.prepared.map((item) => <li key={item}><i>✓</i>{item}</li>)}</ul>
            <p>{priority.preparedSummary}</p>
          </section>
        </aside>

        <aside className="as6-master__guide">
          <section><h2>{t("whyNow")}</h2><p>{priority.why}</p></section>
          <section><h2>{t("whatNext")}</h2><article><div><strong>{priority.nextTime}</strong><span>{priority.next}</span></div></article></section>
          <section><h2>{t("whatChanges")}</h2><p>{priority.change}</p></section>
        </aside>

        <form className="as6-master__intent" onSubmit={submitIntent}>
          <button type="button" className="as6-master__mic" aria-label={listening ? t("voiceStop") : t("voiceStart")} aria-pressed={listening} onClick={() => setListening((value) => !value)}><MicrophoneGlyph listening={listening} /></button>
          <label htmlFor="as6-master-intent">{t("intent")}</label>
          <input id="as6-master-intent" value={intent} onChange={(event) => setIntent(event.target.value)} autoComplete="off" />
          <button type="submit" className="as6-master__send" aria-label={t("sendIntent")} disabled={!intent.trim()}>→</button>
        </form>
      </div>
    </section>
  );
}
