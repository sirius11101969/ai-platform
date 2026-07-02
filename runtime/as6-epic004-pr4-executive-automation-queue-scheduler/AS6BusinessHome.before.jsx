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
import { AS6DataSurface, AS6DataKPI, AS6DataState } from "../../components/AS6UnifiedDataSurface.jsx";
import AS6ExecutiveCommandDashboard from "../../components/AS6ExecutiveCommandDashboard.jsx";
import AS6BackendConnectorStatus from "../../components/AS6BackendConnectorStatus.jsx";
import AS6GlobalHealthBar from "../../components/AS6GlobalHealthBar.jsx";
import AS6LiveOperationalDataStatus from "../../components/AS6LiveOperationalDataStatus.jsx";
import AS6DashboardLiveDataStatus from "../../components/AS6DashboardLiveDataStatus.jsx";
import AS6RevenueCrmFusionStatus from "../../components/AS6RevenueCrmFusionStatus.jsx";
import { applyAS6ExecutiveWorkspaceProfile, createAS6ExecutiveProfileRecommendation, getAS6ExecutiveWorkspaceProfiles } from "./as6ExecutiveWorkspaceProfiles.js";
import { createAS6ExecutiveInsights } from "./as6ExecutiveInsights.js";
import { createAS6ExecutiveAction, executeAS6ExecutiveAction, validateAS6ExecutiveAction } from "./as6ExecutiveActions.js";
import { AS6_EXECUTIVE_AUTOMATION_SCENARIOS, createAS6ExecutiveAutomationPlan, executeAS6ExecutiveAutomationPipeline } from "./as6ExecutiveAutomationScenarios.js";
import "./AS6BusinessHome.css";

export const AS6_BUSINESS_HOME_VERSION = "EPIC004_PR3";
export const AS6_BUSINESS_HOME_LAYOUT_SCHEMA_VERSION = 1;

export const AS6_BUSINESS_HOME_WIDGETS = [
  { id: "ai-brief", title: "AI Brief", defaultPinned: true },
  { id: "metrics", title: "Metrics", defaultPinned: false },
  { id: "workspace", title: "Workspaces", defaultPinned: false },
  { id: "recommendations", title: "Recommendations", defaultPinned: false },
  { id: "activity", title: "Activity", defaultPinned: false },
  { id: "adaptive-suggestions", title: "Adaptive Suggestions", defaultPinned: false },
  { id: "executive-kpi", title: "Executive KPI", defaultPinned: true },
  { id: "executive-platform-health", title: "Executive Platform Health", defaultPinned: false },
  { id: "executive-risk-brief", title: "Executive Risk Brief", defaultPinned: false },
  { id: "executive-command-dashboard", title: "Executive Command Dashboard", defaultPinned: true },
  { id: "backend-connector-status", title: "Backend Connector Status", defaultPinned: false },
  { id: "global-health-bar", title: "Global Health Bar", defaultPinned: false },
  { id: "live-operational-data-status", title: "Live Operational Data Status", defaultPinned: false },
  { id: "dashboard-live-data-status", title: "Dashboard Live Data Status", defaultPinned: false },
  { id: "revenue-crm-fusion-status", title: "Revenue CRM Fusion Status", defaultPinned: false },
  { id: "executive-insights", title: "Executive Insights", defaultPinned: true },
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

export function createAS6BusinessHomeAdaptiveSuggestions(state) {
  const suggestions = [];
  if (state.recommendations?.length) {
    suggestions.push({ id: "pin-ai-brief", title: "Закрепить AI Brief", reason: state.recommendations[0], action: { type: "pin", widgetId: "ai-brief" } });
  }
  if ((state.platformStatus?.workspaceModules || 0) > 0) {
    suggestions.push({ id: "raise-workspace", title: "Поднять Workspaces выше", reason: "Workspace Runtime содержит активные модули.", action: { type: "move-first", widgetId: "workspace" } });
  }
  if ((state.platformStatus?.navigationItems || 0) > 0) {
    suggestions.push({ id: "show-recommendations", title: "Показать рекомендации", reason: "Universal Navigation содержит рабочие переходы.", action: { type: "show", widgetId: "recommendations" } });
  }
  return suggestions.slice(0, 3);
}

function createAS6ExecutiveActionMetrics(history) {
  const events = Array.isArray(history) ? history : [];
  const total = events.length;
  const fallback = events.filter((event) => event.fallback).length;
  const successful = events.filter((event) => event.status === "VALID" && !event.fallback).length;
  const actionCounts = events.reduce((acc, event) => {
    const actionId = event.actionId || "unknown";
    acc[actionId] = (acc[actionId] || 0) + 1;
    return acc;
  }, {});
  const topAction = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "none";
  const recentTargets = [...new Set(events.map((event) => event.target).filter(Boolean))].slice(0, 3);
  return {
    total,
    successful,
    fallback,
    successRate: total ? Math.round((successful / total) * 100) : 0,
    fallbackRate: total ? Math.round((fallback / total) * 100) : 0,
    topAction,
    recentTargets,
  };
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
  const [draggedWidgetId, setDraggedWidgetId] = useState(null);
  const [executiveActionStatus, setExecutiveActionStatus] = useState(null);
  const [executiveActionHistory, setExecutiveActionHistory] = useState([]);
  const [executiveAutomationPlan, setExecutiveAutomationPlan] = useState(null);
  const [executiveAutomationPipeline, setExecutiveAutomationPipeline] = useState({ status: "idle", currentStep: 0, totalSteps: 0, progress: 0, reason: null, completed: [] });
  const [executiveAutomationMonitor, setExecutiveAutomationMonitor] = useState({ events: [], startedAt: null, endedAt: null, durationMs: 0, successfulSteps: 0, stoppedSteps: 0, cancelled: false, completionSignal: "idle" });

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

  function handleBusinessHomeWidgetDragStart(widgetId) {
    setDraggedWidgetId(widgetId);
  }

  function handleBusinessHomeWidgetDragOver(event) {
    event.preventDefault();
  }

  function handleBusinessHomeWidgetDrop(targetWidgetId) {
    if (!draggedWidgetId || draggedWidgetId === targetWidgetId) {
      setDraggedWidgetId(null);
      return;
    }
    updateBusinessHomeLayout((currentLayout) => {
      const ordered = sortAS6BusinessHomeWidgets(currentLayout.widgets);
      const sourceIndex = ordered.findIndex((widget) => widget.id === draggedWidgetId);
      const targetIndex = ordered.findIndex((widget) => widget.id === targetWidgetId);
      if (sourceIndex < 0 || targetIndex < 0) return currentLayout;
      const next = [...ordered];
      const [source] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, source);
      return { ...currentLayout, widgets: next.map((widget, order) => ({ ...widget, order })) };
    });
    setDraggedWidgetId(null);
  }

  function handleBusinessHomeWidgetDragEnd() {
    setDraggedWidgetId(null);
  }

  function appendAS6ExecutiveActionAuditEvent(event) {
    const auditEvent = {
      id: "as6-action-" + Date.now(),
      createdAt: new Date().toISOString(),
      ...event,
    };
    setExecutiveActionHistory((history) => [auditEvent, ...history].slice(0, 8));
  }

  function createAS6ExecutiveAutomationMonitorState(plan, pipeline, cancelled = false) {
    const startedAt = new Date().toISOString();
    const endedAt = new Date().toISOString();
    const successfulSteps = Array.isArray(pipeline?.completed) ? pipeline.completed.length : 0;
    const totalSteps = pipeline?.totalSteps || 0;
    const stoppedSteps = Math.max(totalSteps - successfulSteps, 0);
    return {
      events: [
        { id: "monitor-start-" + Date.now(), type: "started", scenarioId: plan?.scenarioId || "unknown", at: startedAt },
        { id: "monitor-end-" + Date.now(), type: cancelled ? "cancelled" : pipeline?.status || "completed", scenarioId: plan?.scenarioId || "unknown", at: endedAt, reason: cancelled ? "User cancelled scenario" : pipeline?.reason || null },
      ],
      startedAt,
      endedAt,
      durationMs: Math.max(new Date(endedAt).getTime() - new Date(startedAt).getTime(), 0),
      successfulSteps,
      stoppedSteps,
      cancelled,
      completionSignal: cancelled ? "cancelled" : pipeline?.status || "completed",
      reason: cancelled ? "User cancelled scenario" : pipeline?.reason || null,
    };
  }

  function cancelAS6ExecutiveAutomationScenario() {
    setExecutiveAutomationPipeline((pipeline) => ({ ...pipeline, status: "failed", reason: "User cancelled scenario" }));
    setExecutiveAutomationMonitor((monitor) => ({ ...monitor, endedAt: new Date().toISOString(), cancelled: true, completionSignal: "cancelled", reason: "User cancelled scenario", stoppedSteps: Math.max((executiveAutomationPipeline.totalSteps || 0) - (executiveAutomationPipeline.completed?.length || 0), 0), events: [{ id: "monitor-cancel-" + Date.now(), type: "cancelled", at: new Date().toISOString(), reason: "User cancelled scenario" }, ...(monitor.events || [])] }));
  }

  function handleAS6ExecutiveAutomationScenario(scenarioId) {
    const plan = createAS6ExecutiveAutomationPlan(scenarioId);
    setExecutiveAutomationPlan(plan);
    const pipeline = executeAS6ExecutiveAutomationPipeline(plan);
    setExecutiveAutomationPipeline(pipeline);
    setExecutiveAutomationMonitor(createAS6ExecutiveAutomationMonitorState(plan, pipeline));
  }

  function handleAS6ExecutiveAction(insight) {
    const action = createAS6ExecutiveAction(insight);
    const validation = validateAS6ExecutiveAction(action);
    const actionStatus = { ...validation, label: action.label, actionId: action.actionId || "showNextStep" };
    setExecutiveActionStatus(actionStatus);
    appendAS6ExecutiveActionAuditEvent({
      title: insight?.title || "Executive Action",
      actionId: actionStatus.actionId,
      label: actionStatus.label,
      target: actionStatus.target,
      status: actionStatus.status,
      fallback: !validation.ok,
      message: actionStatus.message,
    });
    if (!validation.ok) return;
    executeAS6ExecutiveAction(action);
  }

  function applyAS6ExecutiveProfile(profileName) {
    updateBusinessHomeLayout((currentLayout) => applyAS6ExecutiveWorkspaceProfile(currentLayout, profileName));
  }

  function applyAS6AdaptiveSuggestion(suggestion) {
    if (!suggestion?.action?.widgetId) return;
    updateBusinessHomeLayout((currentLayout) => {
      const widgetId = suggestion.action.widgetId;
      if (suggestion.action.type === "pin") {
        return { ...currentLayout, widgets: currentLayout.widgets.map((widget) => widget.id === widgetId ? { ...widget, pinned: true, visible: true } : widget) };
      }
      if (suggestion.action.type === "show") {
        return { ...currentLayout, widgets: currentLayout.widgets.map((widget) => widget.id === widgetId ? { ...widget, visible: true } : widget) };
      }
      if (suggestion.action.type === "move-first") {
        const ordered = sortAS6BusinessHomeWidgets(currentLayout.widgets);
        const target = ordered.find((widget) => widget.id === widgetId);
        if (!target) return currentLayout;
        const rest = ordered.filter((widget) => widget.id !== widgetId);
        return { ...currentLayout, widgets: [target, ...rest].map((widget, order) => ({ ...widget, visible: widget.id === widgetId ? true : widget.visible, order })) };
      }
      return currentLayout;
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
    if (widgetId === "adaptive-suggestions") {
      const suggestions = createAS6BusinessHomeAdaptiveSuggestions(state);
      return <AS6ExperienceCard eyebrow="AI Adaptive Home" title="Рекомендации AS6" key={widgetId} data-widget-id={widgetId}><div className="as6-business-home__adaptive-list">{suggestions.map((suggestion) => <article key={suggestion.id}><strong>{suggestion.title}</strong><span>{suggestion.reason}</span><button type="button" onClick={() => applyAS6AdaptiveSuggestion(suggestion)}>Применить</button></article>)}</div></AS6ExperienceCard>;
    }
    if (widgetId === "executive-kpi") {
      return <AS6DataSurface title="Executive KPI" key={widgetId} data-widget-id={widgetId}><div className="as6-business-home__executive-grid">{state.metrics.map((metric) => <AS6DataKPI key={metric.label} label={metric.label} value={metric.value} detail={metric.trend} />)}</div></AS6DataSurface>;
    }
    if (widgetId === "executive-platform-health") {
      return <AS6DataSurface title="Platform Health" key={widgetId} data-widget-id={widgetId}><div className="as6-business-home__executive-grid"><AS6DataKPI label="Dashboard" value={state.platformStatus?.dashboard || "UNKNOWN"} detail={(state.platformStatus?.widgets || 0) + " widgets"} /><AS6DataKPI label="Marketplace" value={state.platformStatus?.marketplace || "UNKNOWN"} detail={(state.platformStatus?.packages || 0) + " packages"} /><AS6DataKPI label="Navigation" value={state.platformStatus?.navigationItems || 0} detail="items" /><AS6DataKPI label="Workspace" value={state.platformStatus?.workspaceModules || 0} detail="modules" /></div></AS6DataSurface>;
    }
    if (widgetId === "executive-risk-brief") {
      const hasRisk = state.marketplace?.failures?.length || state.dashboardStatus?.status !== "LIVE";
      return <AS6DataSurface title="Executive Risk Brief" key={widgetId} data-widget-id={widgetId}>{hasRisk ? <ul className="as6-business-home__list">{state.recommendations.map((item) => <li key={item}>{item}</li>)}</ul> : <AS6DataState type="empty" title="Критических рисков не обнаружено" detail="AS6 использует текущие live/fallback данные Business Home." />}</AS6DataSurface>;
    }
    if (widgetId === "executive-command-dashboard") return <AS6ExecutiveCommandDashboard key={widgetId} data-widget-id={widgetId} />;
    if (widgetId === "backend-connector-status") return <AS6BackendConnectorStatus key={widgetId} data-widget-id={widgetId} />;
    if (widgetId === "global-health-bar") return <AS6GlobalHealthBar key={widgetId} data-widget-id={widgetId} />;
    if (widgetId === "live-operational-data-status") return <AS6LiveOperationalDataStatus key={widgetId} data-widget-id={widgetId} />;
    if (widgetId === "dashboard-live-data-status") return <AS6DashboardLiveDataStatus key={widgetId} data-widget-id={widgetId} />;
    if (widgetId === "revenue-crm-fusion-status") return <AS6RevenueCrmFusionStatus key={widgetId} data-widget-id={widgetId} />;
    if (widgetId === "executive-insights") {
      return <AS6DataSurface title="Executive Insights & Recommendations" key={widgetId} data-widget-id={widgetId}><ul className="as6-business-home__list">{executiveInsights.recommendations.map((insight) => <li key={insight.id}><strong>{insight.title}</strong><br /><span>{insight.reason}</span><br /><small>{insight.action}</small><br /><button type="button" onClick={() => handleAS6ExecutiveAction(insight)}>Выполнить безопасное действие</button><br /><small>Target: {validateAS6ExecutiveAction(createAS6ExecutiveAction(insight)).target}</small></li>)}</ul><section className="as6-business-home__automation-scenarios" aria-label="Executive Automation Scenarios"><strong>Executive Automation Scenarios</strong>{Object.values(AS6_EXECUTIVE_AUTOMATION_SCENARIOS).map((scenario) => <button type="button" key={scenario.scenarioId} onClick={() => handleAS6ExecutiveAutomationScenario(scenario.scenarioId)}>{scenario.title}</button>)}{executiveAutomationPlan && <small>Plan: {executiveAutomationPlan.title} / Actions: {executiveAutomationPlan.actions.map((action) => action.actionId).join(" → ")} / Runtime-only</small>}{executiveAutomationPipeline && <small>Status: {executiveAutomationPipeline.status} / Step: {executiveAutomationPipeline.currentStep} of {executiveAutomationPipeline.totalSteps} / Progress: {executiveAutomationPipeline.progress}%{executiveAutomationPipeline.reason ? " / Stop: " + executiveAutomationPipeline.reason : ""}</small>}<button type="button" onClick={cancelAS6ExecutiveAutomationScenario}>Cancel Scenario</button><section className="as6-business-home__automation-monitor" aria-label="Executive Automation Monitor"><strong>Automation Monitor</strong><small>Started: {executiveAutomationMonitor.startedAt || "not started"}</small><small>Ended: {executiveAutomationMonitor.endedAt || "not ended"}</small><small>Duration: {executiveAutomationMonitor.durationMs}ms</small><small>Successful Steps: {executiveAutomationMonitor.successfulSteps}</small><small>Stopped/Skipped Steps: {executiveAutomationMonitor.stoppedSteps}</small><small>Completion: {executiveAutomationMonitor.completionSignal}</small><small>Reason: {executiveAutomationMonitor.reason || "none"}</small>{executiveAutomationMonitor.events.map((event) => <small key={event.id}>{event.type} / {event.at} / {event.reason || "ok"}</small>)}</section></section><section className="as6-business-home__action-metrics" aria-label="Executive Action Metrics"><strong>Executive Action Metrics</strong><div><span>Total: {executiveActionMetrics.total}</span><span>Success: {executiveActionMetrics.successful}</span><span>Success Rate: {executiveActionMetrics.successRate}%</span><span>Fallback: {executiveActionMetrics.fallback}</span><span>Fallback Rate: {executiveActionMetrics.fallbackRate}%</span><span>Top Action: {executiveActionMetrics.topAction}</span><span>Recent Routes: {executiveActionMetrics.recentTargets.join(", ") || "none"}</span></div></section>{executiveActionStatus && <AS6DataState type={executiveActionStatus.ok ? "success" : "warning"} title={executiveActionStatus.status} detail={(executiveActionStatus.label || "Action") + " → " + executiveActionStatus.target + " / " + executiveActionStatus.message} />}{executiveActionHistory.length > 0 && <section className="as6-business-home__action-audit" aria-label="Executive Action Audit Trail"><strong>Action Audit Trail</strong>{executiveActionHistory.map((event) => <article key={event.id}><span>{event.createdAt}</span><strong>{event.actionId}</strong><small>{event.label} → {event.target}</small><small>Status: {event.status} / Fallback: {event.fallback ? "YES" : "NO"}</small></article>)}</section>}<AS6DataState type="empty" title={executiveInsights.profileName} detail={executiveInsights.source} /></AS6DataSurface>;
    }
    return null;
  }

  const executiveInsights = useMemo(() => createAS6ExecutiveInsights(state, "Administrator", createAS6BusinessHomeAdaptiveSuggestions(state)), [state]);
  const executiveActionMetrics = useMemo(() => createAS6ExecutiveActionMetrics(executiveActionHistory), [executiveActionHistory]);
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
            <section className="as6-business-home__executive-profiles" aria-label="Executive Workspace profiles">
              <strong>Executive Profiles</strong>
              <div>
                {getAS6ExecutiveWorkspaceProfiles().map((profileName) => (
                  <button type="button" key={profileName} onClick={() => applyAS6ExecutiveProfile(profileName)}>{profileName}</button>
                ))}
              </div>
              <small>{createAS6ExecutiveProfileRecommendation("Administrator").reason}</small>
            </section>
            <section className="as6-business-home__customizer" aria-label="Business Home widgets">
              <strong>Настройка виджетов</strong>
              {orderedWidgets.map((widget) => (
                <div className="as6-business-home__customizer-row" key={widget.id} draggable="true" data-as6-dragging={draggedWidgetId === widget.id ? "true" : "false"} onDragStart={() => handleBusinessHomeWidgetDragStart(widget.id)} onDragOver={handleBusinessHomeWidgetDragOver} onDrop={() => handleBusinessHomeWidgetDrop(widget.id)} onDragEnd={handleBusinessHomeWidgetDragEnd}>
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
