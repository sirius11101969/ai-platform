import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./AS6MasterScreen.css";
import "./AS6MasterScreenPolish.css";
import "./AS6MasterScreenReference.css";
import { createLivingShellSnapshot } from "./livingShellFoundation.js";
import { livingIntlLocale } from "./livingLocalization.js";
import { useLivingSpeechRecognition } from "./useLivingSpeechRecognition.js";

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
  onCreateWorkspace,
  onPriorityChange,
  theme = "light",
  onThemeChange,
}) {
  const shell = snapshot || createLivingShellSnapshot({
    locale: "ru",
    user: { displayName: profileName },
    fallbackProfileName: profileName,
    dataStatus: "ready",
  });
  const { t, identity, priority } = shell;
  const [intent, setIntent] = useState("");
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceCreateOpen, setWorkspaceCreateOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceStatus, setWorkspaceStatus] = useState({ busy: false, message: "", error: false });
  const [activeSpace, setActiveSpace] = useState(null);
  const [panel, setPanel] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [intentSource, setIntentSource] = useState("suggested");
  const acceptTranscript = useCallback((transcript) => {
    setIntent(transcript);
    setIntentSource("voice");
  }, []);
  const speech = useLivingSpeechRecognition({ locale: shell.locale, onTranscript: acceptTranscript });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setIntent("");
    setIntentSource("suggested");
  }, [priority.id]);

  const time = useMemo(() => formatTime(now, shell.locale), [now, shell.locale]);
  const date = useMemo(() => formatDate(now, shell.locale), [now, shell.locale]);
  const activeSpaceData = shell.spaces.find((space) => space.id === activeSpace);
  const resolvedIntent = intent.trim() || String(priority.intent || "").trim();

  function submitIntent(event) {
    event.preventDefault();
    if (!resolvedIntent) return;
    navigateForPriority(priority.actionTarget || "conductor", {
      intent: resolvedIntent,
      intentSource: intent.trim() ? intentSource : "suggested",
    });
  }

  function chooseWorkspace(workspaceId) {
    setWorkspaceOpen(false);
    onWorkspaceChange?.(workspaceId);
  }

  async function submitWorkspace(event) {
    event.preventDefault();
    const name = workspaceName.trim();
    if (!name || workspaceStatus.busy) return;
    setWorkspaceStatus({ busy: true, message: t("creatingWorkspace"), error: false });
    try {
      await onCreateWorkspace?.(name);
      setWorkspaceName("");
      setWorkspaceCreateOpen(false);
      setWorkspaceOpen(false);
      setWorkspaceStatus({ busy: false, message: t("workspaceCreated"), error: false });
    } catch (error) {
      const limitReached = error?.code === "WORKSPACE_LIMIT_REACHED" || error?.status === 402;
      setWorkspaceStatus({ busy: false, message: limitReached ? t("workspaceLimitReached") : (error?.message || t("saveError")), error: true });
    }
  }

  function navigateForPriority(target, extra = {}) {
    navigate?.(target, {
      contractVersion: "as6-conductor-context-v1",
      workspaceId: shell.workspace?.id || "",
      snapshotId: shell.snapshotId,
      priorityId: priority.id,
      leadId: priority.leadId,
      actionCode: priority.actionCode,
      intent: priority.intent,
      intentSource: "suggested",
      locale: shell.locale,
      ...extra,
    });
  }

  function activityTime(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat(livingIntlLocale(shell.locale), { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  }

  return (
    <section
      className={`as6-master${speech.listening ? " is-listening" : ""}`}
      aria-label={`AS6 — ${t("today")}`}
      data-shell-version={shell.version}
      data-shell-snapshot={shell.snapshotId}
      data-data-state={shell.dataState.status}
      data-theme={theme}
    >
      <div className="as6-master__ambient" aria-hidden="true" />
      <p className="as6-master__sr-only" aria-live="polite">{shell.dataState.message}</p>

      <div className="as6-master__canvas">
        <header className="as6-master__topbar">
          <div className="as6-master__today">
            <h1>{t("today")}</h1>
            <button type="button" className="as6-master__overnight" onClick={() => setPanel("activity")}>{t("overnight", { count: shell.actionCount })}</button>
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
            <button type="button" className={theme === "light" ? "is-active" : ""} aria-label={t("lightTheme")} aria-pressed={theme === "light"} onClick={() => onThemeChange?.("light")}>☼</button>
            <button type="button" className={theme === "dark" ? "is-active" : ""} aria-label={t("darkTheme")} aria-pressed={theme === "dark"} onClick={() => onThemeChange?.("dark")}>☾</button>
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
                onClick={() => navigateForPriority(space.id)}
                aria-label={`${space.label}. ${space.note}`}
              >
                <span className="as6-master__node-mark" aria-hidden="true"><NodeGlyph type={space.id} /></span>
                <strong>{space.label}</strong><small>{space.note}</small>
              </button>
            );
          })}

          <article className="as6-master__focus" key={priority.id}>
            <span className="as6-master__focus-kicker">{t("mainGoal")}</span>
            <button type="button" className="as6-master__goal-button" onClick={() => setPanel("goals")}><h2>{priority.title}</h2></button>
            <button type="button" className="as6-master__thinking" aria-live="polite" onClick={() => navigateForPriority(priority.actionTarget || "conductor", { actionCode: priority.actionCode })}>
              <span className="as6-master__thinking-dot" aria-hidden="true" />
              <div><small>{t("as6Now")}</small><strong>{priority.activity}</strong></div>
            </button>
            <button type="button" className="as6-master__outcome" onClick={() => navigateForPriority("analytics")}>
              <span>{priority.metricLabel}</span>
              <strong>{priority.metricValue}</strong>
              <small>{priority.metricDelta}</small>
            </button>
          </article>
          <nav className="as6-master__space-status" aria-label={t("goalEvidence")}>
            {activeSpaceData
              ? <span aria-live="polite">{activeSpaceData.label}: {activeSpaceData.note}</span>
              : priority.chain.map((item, index) => <React.Fragment key={item.id}>{index > 0 && <i aria-hidden="true">→</i>}<button type="button" onClick={() => navigateForPriority(item.id)}>{item.label}</button></React.Fragment>)}
          </nav>
        </main>

        <aside className="as6-master__identity">
          <button
            type="button"
            className={`as6-master__logo${identity.showCompanyLogo ? " is-company" : ""}`}
            onClick={() => navigate?.("home")}
            aria-label={identity.showCompanyLogo ? identity.workspaceName : t("platformBrand")}
          >
            {identity.showCompanyLogo
              ? <img className="as6-master__logo-image" src={identity.companyLogoUrl} alt={identity.workspaceName} style={{ "--as6-company-logo-scale": identity.companyLogoScale / 100 }} />
              : <><span>AS6</span><small>AI PLATFORM</small></>}
          </button>
          <button
            type="button"
            className="as6-master__workspace"
            onClick={() => setWorkspaceOpen((value) => !value)}
            aria-expanded={workspaceOpen}
            aria-label={t("switchWorkspace")}
          >
            <span className="as6-master__workspace-label">{t("companySwitcher")}</span>
            <span className="as6-master__workspace-value"><b>{identity.workspaceName}</b><i aria-hidden="true">⌄</i></span>
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
              <button type="button" className="as6-master__plan-status" onClick={() => window.location.assign("/pricing")}>
                <strong>{t("activePlan", { plan: shell.subscription.name })}</strong>
                <span>{t("managePlan")}</span>
              </button>
              <small>{t("workspaceLimit", shell.workspaceAllowance)}</small>
              {workspaceCreateOpen && shell.workspaceAllowance.canCreate && (
                <form className="as6-master__workspace-create" onSubmit={submitWorkspace}>
                  <label htmlFor="as6-workspace-name">{t("createWorkspaceTitle")}</label>
                  <input id="as6-workspace-name" value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} placeholder={t("companyNamePlaceholder")} autoFocus />
                  <button type="submit" disabled={!workspaceName.trim() || workspaceStatus.busy}>{workspaceStatus.busy ? t("creatingWorkspace") : t("createWorkspace")}</button>
                </form>
              )}
              {!workspaceCreateOpen && <button type="button" className="as6-master__workspace-add" onClick={() => shell.workspaceAllowance.canCreate ? setWorkspaceCreateOpen(true) : window.location.assign("/pricing")}>{shell.workspaceAllowance.canCreate ? `+ ${t("createWorkspace")}` : t("upgradePlan")}</button>}
              {workspaceStatus.message && <small className={workspaceStatus.error ? "is-error" : ""}>{workspaceStatus.message}</small>}
              <button type="button" className="as6-master__workspace-settings" onClick={() => navigate?.("settings")}>{t("settings")}</button>
            </div>
          )}

          <div className="as6-master__greeting">
            <strong>{t("greeting", { name: identity.displayName })}</strong>
            <span>{t("dayReady")}</span>
          </div>
          <div className="as6-master__avatar" aria-label={`Profile: ${identity.displayName}`} style={{ "--as6-avatar-scale": identity.avatarScale / 100 }}>
            <span>{identity.avatarUrl ? <img src={identity.avatarUrl} alt="" /> : identity.initial}</span>
          </div>

          <section className="as6-master__ready">
            <h2>{t("prepared")}</h2>
            <ul>{priority.prepared.map((item) => <li key={item.label}><i>✓</i><button type="button" onClick={() => navigateForPriority(item.target)}>{item.label}</button></li>)}</ul>
            <p>{priority.preparedSummary}</p>
          </section>
        </aside>

        <aside className="as6-master__guide">
          <section><h2>{t("whyNow")}</h2><button type="button" onClick={() => setPanel("goals")}>{priority.why}</button></section>
          <section><h2>{t("whatNext")}</h2><button type="button" onClick={() => navigateForPriority(priority.actionTarget || "conductor")}><strong>{priority.nextTime}</strong><span>{priority.next}</span></button></section>
          <section><h2>{t("whatChanges")}</h2><button type="button" onClick={() => navigateForPriority("analytics")}>{priority.change}</button></section>
        </aside>

        <form className="as6-master__intent" onSubmit={submitIntent}>
          <button type="button" className="as6-master__mic" aria-label={speech.listening ? t("voiceStop") : t("voiceStart")} aria-pressed={speech.listening} onClick={speech.toggle}><MicrophoneGlyph listening={speech.listening} /></button>
          <label htmlFor="as6-master-intent">{t("intent")}</label>
          <input id="as6-master-intent" value={intent} onChange={(event) => { setIntent(event.target.value); setIntentSource("typed"); }} placeholder={priority.intent} autoComplete="off" />
          <button type="submit" className="as6-master__send" aria-label={t("sendIntent")} disabled={!resolvedIntent}>→</button>
          <span className="as6-master__voice-status" aria-live="polite">{speech.listening ? t("voiceListening") : speech.error ? (speech.error === "unsupported" ? t("voiceUnsupported") : t("voiceError")) : ""}</span>
        </form>

        {panel && (
          <div className="as6-master__panel-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPanel(""); }}>
            <section className="as6-master__panel" role="dialog" aria-modal="true" aria-labelledby="as6-panel-title">
              <header><h2 id="as6-panel-title">{panel === "activity" ? t("activityLog") : t("goals")}</h2><button type="button" onClick={() => setPanel("")} aria-label={t("close")}>×</button></header>
              {panel === "activity" ? (
                <div className="as6-master__activity-list">
                  {shell.activity.length ? shell.activity.map((event) => <button type="button" key={event.id} onClick={() => { setPanel(""); navigate?.(event.leadId ? "relations" : "analytics", { leadId: event.leadId, activityId: event.id }); }}><time>{activityTime(event.createdAt)}</time><span><strong>{event.title}</strong>{event.body && <small>{event.body}</small>}</span><b>→</b></button>) : <p>{t("noActivity")}</p>}
                  <article><small>{t("activityInsight")}</small><strong>{priority.why}</strong></article>
                </div>
              ) : (
                <div className="as6-master__goal-list">
                  {shell.goalOptions.map((goal) => <button type="button" key={goal.id} className={goal.id === priority.id ? "is-current" : ""} onClick={() => { onPriorityChange?.(goal.id); setPanel(""); }}><span><small>{goal.id === priority.id ? t("currentGoal") : t("chooseGoal")}</small><strong>{goal.title}</strong><em>{goal.activity}</em></span><b>→</b></button>)}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </section>
  );
}
