import { useEffect, useMemo, useState } from "react";
import {
  AS6ExperienceButton,
  AS6ExperienceCard,
  AS6ExperienceMetric,
  AS6ExperiencePanel,
  AS6ExperienceShell,
} from "../experience-system";
import { createAS6BusinessHomeLiveData } from "./AS6BusinessHomeLiveData";
import { getAS6ActiveWorkspaceSession, getAS6WorkspaceSessions, saveAS6WorkspaceSession, setAS6ActiveWorkspaceSession, validateAS6WorkspacePersistencePolicy } from "../workspace/as6WorkspaceStorage.js";
import { AS6Workspace, AS6Sidebar, AS6Header, AS6RightRail, AS6Assistant, AS6Focus } from "../../components/as6-workspace/AS6Workspace.jsx";
import "./AS6BusinessHome.css";

export const AS6_BUSINESS_HOME_VERSION = "EPIC001_PR7";
export const AS6_BUSINESS_HOME_LAYOUT_SCHEMA_VERSION = 1;

export const AS6_BUSINESS_HOME_WIDGETS = [
  { id: "ai-brief", title: "AI Brief", defaultPinned: true },
  { id: "metrics", title: "Metrics", defaultPinned: false },
  { id: "workspace", title: "Workspaces", defaultPinned: false },
  { id: "recommendations", title: "Recommendations", defaultPinned: false },
  { id: "activity", title: "Activity", defaultPinned: false },
];

export function createAS6BusinessHomeDefaultLayout() {
  return {
    schemaVersion: AS6_BUSINESS_HOME_LAYOUT_SCHEMA_VERSION,
    widgets: AS6_BUSINESS_HOME_WIDGETS.map((widget, index) => ({
      id: widget.id,
      visible: true,
      pinned: Boolean(widget.defaultPinned),
      order: index,
    })),
  };
}

export function normalizeAS6BusinessHomeLayout(layout) {
  const defaults = createAS6BusinessHomeDefaultLayout();
  const knownIds = new Set(AS6_BUSINESS_HOME_WIDGETS.map((widget) => widget.id));
  const savedWidgets = Array.isArray(layout?.widgets) ? layout.widgets : [];
  const savedById = new Map(savedWidgets.filter((widget) => knownIds.has(widget?.id)).map((widget) => [widget.id, widget]));
  return {
    schemaVersion: AS6_BUSINESS_HOME_LAYOUT_SCHEMA_VERSION,
    widgets: defaults.widgets.map((widget) => {
      const saved = savedById.get(widget.id);
      return {
        ...widget,
        visible: typeof saved?.visible === "boolean" ? saved.visible : widget.visible,
        pinned: typeof saved?.pinned === "boolean" ? saved.pinned : widget.pinned,
        order: Number.isFinite(saved?.order) ? saved.order : widget.order,
      };
    }),
  };
}

export function validateAS6BusinessHomeLayout(layout) {
  const failures = [];
  const normalized = normalizeAS6BusinessHomeLayout(layout);
  if (layout && layout.schemaVersion !== AS6_BUSINESS_HOME_LAYOUT_SCHEMA_VERSION) failures.push("AS6_BUSINESS_HOME_LAYOUT_SCHEMA_MISMATCH");
  if (normalized.widgets.length !== AS6_BUSINESS_HOME_WIDGETS.length) failures.push("AS6_BUSINESS_HOME_LAYOUT_RESTORE_GAP");
  if (!normalized.widgets.every((widget) => Number.isFinite(widget.order))) failures.push("AS6_BUSINESS_HOME_WIDGET_ORDER_DRIFT");
  if (!normalized.widgets.every((widget) => typeof widget.visible === "boolean")) failures.push("AS6_BUSINESS_HOME_WIDGET_VISIBILITY_DRIFT");
  if (!normalized.widgets.every((widget) => typeof widget.pinned === "boolean")) failures.push("AS6_BUSINESS_HOME_PINNED_WIDGET_DRIFT");
  return { ok: failures.length === 0, failures, layout: normalized };
}

function sortAS6BusinessHomeWidgets(widgets) {
  return [...widgets].sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.order - b.order || a.id.localeCompare(b.id));
}

export function getAS6BusinessHomeUserName() {
  try {
    const rawUser = localStorage.getItem("as6-user") || localStorage.getItem("user");
    if (rawUser === null) return "Добро пожаловать";
    const user = JSON.parse(rawUser);
    return user?.name || user?.firstName || user?.email || "Добро пожаловать";
  } catch {
    return "Добро пожаловать";
  }
}

export function getAS6BusinessHomeWorkspaceState() {
  const activeWorkspace = getAS6ActiveWorkspaceSession() || null;
  const workspaceSessions = getAS6WorkspaceSessions();
  const policy = validateAS6WorkspacePersistencePolicy();
  const businessHomeLayout = normalizeAS6BusinessHomeLayout(activeWorkspace?.contextState?.businessHome);
  const businessHomeLayoutPolicy = validateAS6BusinessHomeLayout(activeWorkspace?.contextState?.businessHome);
  return { activeWorkspace, workspaceSessions, policy, businessHomeLayout, businessHomeLayoutPolicy };
}

export function getAS6BusinessHomeState() {
  return {
    version: AS6_BUSINESS_HOME_VERSION,
    userName: getAS6BusinessHomeUserName(),
    ...createAS6BusinessHomeLiveData(),
    ...getAS6BusinessHomeWorkspaceState(),
  };
}

export function AS6BusinessHome() {
  const [workspaceRevision, setWorkspaceRevision] = useState(0);
  const state = useMemo(() => getAS6BusinessHomeState(), [workspaceRevision]);
  const [layout, setLayout] = useState(state.businessHomeLayout);

  useEffect(() => {
    setLayout(state.businessHomeLayout);
  }, [state.activeWorkspace?.id, workspaceRevision]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveAS6WorkspaceSession({
        id: state.activeWorkspace?.id || "business-home-default",
        title: state.activeWorkspace?.title || "Business Home",
        activeLivingSpace: "/business-home",
        openedPanels: ["sidebar", "header", "rightRail", "assistant", "focus"],
        contextState: {
          ...(state.activeWorkspace?.contextState || {}),
          source: "AS6BusinessHome",
          version: state.version,
          businessHome: normalizeAS6BusinessHomeLayout(layout),
        },
        intelligenceState: { recommendation: state.recommendations?.[0] || null },
        pinned: true,
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [layout]);

  function refreshWorkspaceState() {
    setWorkspaceRevision((value) => value + 1);
  }

  function updateBusinessHomeLayout(updater) {
    setLayout((currentLayout) => normalizeAS6BusinessHomeLayout(updater(currentLayout)));
  }

  function switchBusinessWorkspace(event) {
    setAS6ActiveWorkspaceSession(event.target.value);
    refreshWorkspaceState();
  }

  function toggleBusinessHomeWidgetVisibility(widgetId) {
    updateBusinessHomeLayout((currentLayout) => ({
      ...currentLayout,
      widgets: currentLayout.widgets.map((widget) => widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget),
    }));
  }

  function toggleBusinessHomeWidgetPin(widgetId) {
    updateBusinessHomeLayout((currentLayout) => ({
      ...currentLayout,
      widgets: currentLayout.widgets.map((widget) => widget.id === widgetId ? { ...widget, pinned: !widget.pinned } : widget),
    }));
  }

  function moveBusinessHomeWidget(widgetId, direction) {
    updateBusinessHomeLayout((currentLayout) => {
      const ordered = sortAS6BusinessHomeWidgets(currentLayout.widgets);
      const index = ordered.findIndex((widget) => widget.id === widgetId);
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) return currentLayout;
      const next = [...ordered];
      const current = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = current;
      return { ...currentLayout, widgets: next.map((widget, order) => ({ ...widget, order })) };
    });
  }

  function renderBusinessHomeWidget(widgetId) {
    if (widgetId === "ai-brief") {
      return (
        <AS6ExperiencePanel className="as6-business-home__brief" key={widgetId} data-widget-id={widgetId}>
          <div>
            <p className="as6x-eyebrow">AI Brief</p>
            <h2>{state.brief.title}</h2>
            <p>{state.brief.summary}</p>
          </div>
          <div className="as6-business-home__brief-actions">
            {state.brief.actions.map((action) => <AS6ExperienceButton key={action} variant="ghost">{action}</AS6ExperienceButton>)}
          </div>
        </AS6ExperiencePanel>
      );
    }
    if (widgetId === "metrics") {
      return <section className="as6-business-home__metrics" key={widgetId} data-widget-id={widgetId}>{state.metrics.map((metric) => <AS6ExperienceCard key={metric.label}><AS6ExperienceMetric {...metric} /></AS6ExperienceCard>)}</section>;
    }
    if (widgetId === "workspace") {
      return <AS6ExperienceCard eyebrow="Workspaces" title="Быстрый переход" key={widgetId} data-widget-id={widgetId}><div className="as6-business-home__chips">{["CRM", "Documents", "Finance", "Communication", "Automation", "Marketplace"].map((item) => <span key={item}>{item}</span>)}</div></AS6ExperienceCard>;
    }
    if (widgetId === "recommendations") {
      return <AS6ExperienceCard eyebrow="Recommendations" title="Следующие действия" key={widgetId} data-widget-id={widgetId}><ul className="as6-business-home__list">{state.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></AS6ExperienceCard>;
    }
    if (widgetId === "activity") {
      return <AS6ExperienceCard eyebrow="Activity" title="Последние события" key={widgetId} data-widget-id={widgetId}><ul className="as6-business-home__list">{state.activity.map((item) => <li key={item}>{item}</li>)}</ul></AS6ExperienceCard>;
    }
    return null;
  }

  const orderedWidgets = sortAS6BusinessHomeWidgets(layout.widgets);
  const visibleWidgets = orderedWidgets.filter((widget) => widget.visible);

  return (
    <AS6ExperienceShell>
      <AS6Workspace className="as6-business-home-shell" dataRoute="business-home" mode="business-os">
        <AS6Sidebar className="as6-business-home-shell__sidebar">
          <strong>AS6</strong>
          <span>Business OS</span>
          <nav aria-label="Business OS navigation">
            <a href="/business-home">Home</a>
            <a href="/crm-workspace">CRM</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/marketplace">Marketplace</a>
          </nav>
        </AS6Sidebar>
        <main className="as6-business-home-shell__main">
          <AS6Header className="as6-business-home-shell__header">
            <div>
              <span className="as6x-eyebrow">Unified Workspace</span>
              <strong>AS6 Business OS</strong>
            </div>
            <div className="as6-business-home-shell__workspace-control">
              <span>{state.version}</span>
              <select aria-label="Saved Business OS Workspace" value={state.activeWorkspace?.id || ""} onChange={switchBusinessWorkspace}>
                <option value="">Default Workspace</option>
                {state.workspaceSessions.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.title}</option>)}
              </select>
              <span>Auto Save</span>
            </div>
          </AS6Header>
          <section className="as6-business-home">
            <header className="as6-business-home__hero">
              <div>
                <p className="as6x-eyebrow">AS6 Business OS</p>
                <h1>{state.userName === "Добро пожаловать" ? state.userName : "Доброе утро, " + state.userName}</h1>
                <p>Состояние бизнеса, рекомендации AI и быстрый запуск рабочих сценариев.</p>
              </div>
              <div className="as6-business-home__commandbar" role="search" aria-label="AS6 AI Command Bar">
                <span>Ask AS6...</span>
                <small>Search • Ask AI • Open Module</small>
              </div>
              <AS6ExperienceButton>Что вы хотите сделать?</AS6ExperienceButton>
            </header>
            <section className="as6-business-home__customizer" aria-label="Business Home widgets">
              <strong>Настройка виджетов</strong>
              {orderedWidgets.map((widget) => (
                <div className="as6-business-home__customizer-row" key={widget.id}>
                  <span>{widget.id}</span>
                  <button type="button" onClick={() => moveBusinessHomeWidget(widget.id, "up")}>↑</button>
                  <button type="button" onClick={() => moveBusinessHomeWidget(widget.id, "down")}>↓</button>
                  <button type="button" onClick={() => toggleBusinessHomeWidgetPin(widget.id)}>{widget.pinned ? "Открепить" : "Закрепить"}</button>
                  <button type="button" onClick={() => toggleBusinessHomeWidgetVisibility(widget.id)}>{widget.visible ? "Скрыть" : "Показать"}</button>
                </div>
              ))}
            </section>
            <section className="as6-business-home__dynamic-widgets">
              {visibleWidgets.map((widget) => renderBusinessHomeWidget(widget.id))}
            </section>
          </section>
        </main>
        <AS6RightRail className="as6-business-home-shell__rail">
          <section className="as6-business-home-shell__persistence" aria-label="Workspace Persistence">
            <strong>Workspace Persistence</strong>
            <span>Active: {state.activeWorkspace?.title || "Default Workspace"}</span>
            <small>Policy: {state.policy.ok ? "PASS" : state.policy.failures.join(", ")}</small>
            <small>Layout: {state.businessHomeLayoutPolicy.ok ? "PASS" : state.businessHomeLayoutPolicy.failures.join(", ")}</small>
          </section>
          <AS6Focus className="as6-business-home-shell__focus">
            <strong>Следующий лучший шаг</strong>
            <span>{state.recommendations?.[0] || "AS6 готов определить приоритет."}</span>
          </AS6Focus>
          <AS6Assistant className="as6-business-home-shell__assistant">
            <strong>AS6 Assistant</strong>
            <span>Всегда знает следующий лучший шаг.</span>
            <button type="button">Спросить AS6</button>
          </AS6Assistant>
        </AS6RightRail>
      </AS6Workspace>
    </AS6ExperienceShell>
  );
}
