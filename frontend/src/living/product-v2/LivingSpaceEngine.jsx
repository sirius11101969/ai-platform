import React, { useMemo, useState } from "react";
import "./LivingSpaceEngine.css";

const copy = {
  ru: {
    back: "Вернуться на главный экран",
    greeting: "Доброе утро",
    conductor: "AI-дирижёр",
    conductorTitle: "Намерение и план",
    conductorCenter: "Следующий безопасный шаг",
    conductorCore: "AS6 сохраняет выбранный контекст и готовит план до выполнения действия.",
    context: "Выбранная цель и рабочая компания переданы с главного экрана.",
    coreLabel: "Центр понимания",
    activityTitle: "Что происходит сейчас",
    activitySubtitle: "Живые события и обновления",
    activityNow: "Сейчас",
    activityText: "Приоритет принят. AS6 готовит подтверждённый контекст.",
    confidence: "Состояние пространства",
    confidenceNote: "Система использует только подтверждённые данные",
    path: "Мышление пространства",
    recommendation: "Рекомендация дня",
    recommendationText: "AS6 собрал подтверждённый контекст и показывает одно полезное действие.",
    discuss: "Обсудить с AI",
    intentLabel: "Расскажите, что вы хотите получить.",
    intentPlaceholder: "Что вы хотите уточнить по выбранной цели?",
    map: "живая карта",
    nodeMeta: "Открыть контекст",
    nodeNote: "Связано с пространством",
    contextMismatch: "Компания изменилась. Вернитесь на главный экран и выберите цель заново — AS6 не смешивает данные разных компаний.",
    contextMismatchTitle: "Нужно обновить контекст компании",
    steps: ["Понял задачу", "Нашёл данные", "Проверил связи", "Подготовил решение", "Ожидает подтверждения"],
  },
  en: {
    back: "Back to the main screen",
    greeting: "Good morning",
    conductor: "AI Conductor",
    conductorTitle: "Intent and plan",
    conductorCenter: "Next safe step",
    conductorCore: "AS6 keeps the selected context and prepares a plan before taking action.",
    context: "The selected goal and workspace were passed from the main screen.",
    coreLabel: "Understanding center",
    activityTitle: "What is happening now",
    activitySubtitle: "Live events and updates",
    activityNow: "Now",
    activityText: "Priority received. AS6 is preparing verified context.",
    confidence: "Workspace status",
    confidenceNote: "The system uses verified data only",
    path: "Workspace reasoning",
    recommendation: "Recommendation of the day",
    recommendationText: "AS6 collected verified context and shows one useful action.",
    discuss: "Discuss with AI",
    intentLabel: "Tell AS6 what outcome you want.",
    intentPlaceholder: "What would you like to clarify about the selected goal?",
    map: "living map",
    nodeMeta: "Open context",
    nodeNote: "Connected to the workspace",
    contextMismatch: "The workspace changed. Return to the main screen and select the goal again — AS6 never mixes data from different companies.",
    contextMismatchTitle: "Workspace context must be refreshed",
    steps: ["Understood the task", "Found the data", "Checked links", "Prepared a solution", "Awaiting confirmation"],
  },
};

export default function LivingSpaceEngine({ definition, navigate, navigationContext = {}, snapshot = null }) {
  const [intent, setIntent] = useState("");
  const locale = snapshot?.locale === "en" ? "en" : "ru";
  const t = copy[locale];
  const incomingIntent = String(navigationContext.intent || "").trim();
  const isConductor = definition.id === "conductor";
  const priority = snapshot?.priority || {};
  const workspaceName = snapshot?.identity?.workspaceName || snapshot?.workspace?.name || "AS6";
  const profileName = snapshot?.identity?.displayName || (locale === "en" ? "Vladimir" : "Владимир");
  const verifiedSnapshot = ["ready", "stale"].includes(snapshot?.dataState?.status);
  const workspaceMismatch = Boolean(
    navigationContext.workspaceId
    && snapshot?.workspace?.id
    && navigationContext.workspaceId !== snapshot.workspace.id
  );
  const priorityMismatch = Boolean(
    verifiedSnapshot
    && navigationContext.priorityId
    && priority.id
    && navigationContext.priorityId !== priority.id
  );
  const leadMismatch = Boolean(
    verifiedSnapshot
    && navigationContext.leadId
    && priority.leadId
    && navigationContext.leadId !== priority.leadId
  );
  const contextMismatch = isConductor && (workspaceMismatch || priorityMismatch || leadMismatch);
  const effectiveDefinition = useMemo(() => {
    if (!isConductor) return definition;
    const confidenceValue = Number.parseFloat(String(priority.metricValue || definition.confidence || 0));
    return {
      ...definition,
      label: t.conductor,
      spaceTitle: t.conductorTitle,
      center: contextMismatch ? t.contextMismatchTitle : (priority.title || t.conductorCenter),
      coreLabel: t.coreLabel,
      coreText: contextMismatch ? t.contextMismatch : (incomingIntent || priority.activity || t.conductorCore),
      greeting: `${t.greeting}, ${profileName}.`,
      context: t.context,
      confidence: contextMismatch ? 0 : (Number.isFinite(confidenceValue) ? confidenceValue : 0),
      confidenceNote: priority.metricDelta || t.confidenceNote,
      recommendation: contextMismatch ? t.contextMismatchTitle : (incomingIntent || priority.activity || t.conductorCenter),
      recommendationText: priority.why || t.recommendationText,
      intentLabel: t.intentLabel,
      intentPlaceholder: incomingIntent || priority.intent || t.intentPlaceholder,
      activityTitle: t.activityTitle,
      activitySubtitle: t.activitySubtitle,
      emptyActivity: t.activityText,
      pathTitle: t.path,
      steps: t.steps,
    };
  }, [contextMismatch, definition, incomingIntent, isConductor, priority, profileName, t]);
  const nodes = useMemo(() => effectiveDefinition.nodes || [], [effectiveDefinition]);
  const events = effectiveDefinition.events || [];
  const insights = effectiveDefinition.insights || [];
  const steps = effectiveDefinition.steps || t.steps;
  const confidence = Number(effectiveDefinition.confidence || 0);

  function buildConductorContext(nextIntent, source = "typed") {
    return {
      ...navigationContext,
      contractVersion: "as6-conductor-context-v1",
      workspaceId: snapshot?.workspace?.id || navigationContext.workspaceId || "",
      snapshotId: snapshot?.snapshotId || navigationContext.snapshotId || "",
      priorityId: priority.id || navigationContext.priorityId || "",
      leadId: priority.leadId || navigationContext.leadId || "",
      actionCode: priority.actionCode || navigationContext.actionCode || "",
      intent: nextIntent,
      intentSource: source,
      locale,
    };
  }

  function submitIntent(event) {
    event.preventDefault();
    if (contextMismatch) return;
    const nextIntent = intent.trim() || incomingIntent;
    if (!nextIntent) return;
    if (typeof effectiveDefinition.onIntent === "function") effectiveDefinition.onIntent(nextIntent);
    navigate("conductor", buildConductorContext(nextIntent, "typed"));
  }

  function discussRecommendation() {
    if (contextMismatch) {
      navigate("home");
      return;
    }
    const nextIntent = incomingIntent || effectiveDefinition.recommendation || priority.activity || "";
    if (isConductor) {
      setIntent(nextIntent);
      return;
    }
    navigate("conductor", buildConductorContext(nextIntent, "suggested"));
  }

  return (
    <div
      className="as6-canonical-space"
      data-space-engine="canonical-v2"
      data-space-id={effectiveDefinition.id}
      data-workspace-id={navigationContext.workspaceId || snapshot?.workspace?.id || ""}
      data-priority-id={navigationContext.priorityId || priority.id || ""}
      data-context-ready={isConductor && !contextMismatch && (incomingIntent || priority.id) ? "true" : "false"}
      data-context-mismatch={contextMismatch ? "true" : "false"}
    >
      <aside className="as6-canonical-space__left" aria-label="Контекст пространства">
        {isConductor && <button type="button" className="as6-canonical-space__back" onClick={() => navigate("home")}>← {t.back}</button>}
        <header><span>{effectiveDefinition.greeting || `${t.greeting}, ${profileName}.`}</span><p>{effectiveDefinition.context || effectiveDefinition.subtitle}</p></header>
        {isConductor && <p className="as6-canonical-space__workspace-context">{workspaceName}</p>}
        <div className="as6-canonical-space__insights">
          {insights.map((item) => <article key={item.label}><i aria-hidden="true" /><div><strong>{item.value}</strong><span>{item.label}</span></div></article>)}
        </div>
      </aside>

      <main className="as6-canonical-space__main">
        <header className="as6-canonical-space__title"><h1>{effectiveDefinition.label}</h1><p>{effectiveDefinition.spaceTitle || effectiveDefinition.subtitle}</p></header>
        <section className="as6-canonical-space__universe" aria-label={`${effectiveDefinition.label}: ${t.map}`}>
          <div className="as6-canonical-space__mesh" aria-hidden="true" />
          <article className="as6-canonical-space__core">
            <span>{effectiveDefinition.symbol}</span><h2>{effectiveDefinition.center}</h2><small>{effectiveDefinition.coreLabel || t.coreLabel}</small><p>{effectiveDefinition.coreText || effectiveDefinition.subtitle}</p>
          </article>
          {nodes.slice(0, 7).map((node, index) => {
            const item = typeof node === "string" ? { label: node } : node;
            return <button type="button" key={`${item.label}-${index}`} className={`as6-canonical-space__node as6-canonical-space__node--${index + 1}`} onClick={() => setIntent(`${locale === "en" ? "Show the key point" : "Покажи главное"}: ${item.label.toLowerCase()}`)}><strong>{item.label}</strong><span>{item.value || item.meta || t.nodeMeta}</span><small>{item.note || t.nodeNote}</small></button>;
          })}
        </section>
      </main>

      <aside className="as6-canonical-space__right" aria-label="События пространства">
        <header><h2>{effectiveDefinition.activityTitle || t.activityTitle}</h2><p>{effectiveDefinition.activitySubtitle || t.activitySubtitle}</p></header>
        <div className="as6-canonical-space__events">
          {(events.length ? events : [{ time: t.activityNow, text: effectiveDefinition.emptyActivity || t.activityText }]).map((event, index) => <article key={`${event.time}-${index}`}><i /><time>{event.time}</time><p>{event.text}</p></article>)}
        </div>
        <section className="as6-canonical-space__confidence"><span>{t.confidence}</span><strong>{confidence}%</strong><small>{effectiveDefinition.confidenceNote || t.confidenceNote}</small></section>
      </aside>

      <section className="as6-canonical-space__path" aria-label="Путь работы пространства">
        <span>{effectiveDefinition.pathTitle || t.path}</span><div>{steps.map((step, index) => <article key={step} className={index < Math.max(1, steps.length - 1) ? "is-complete" : ""}><i /><small>{step}</small></article>)}</div>
      </section>

      <section className="as6-canonical-space__recommendation">
        <div><span>{t.recommendation}</span><h2>{effectiveDefinition.recommendation}</h2><p>{effectiveDefinition.recommendationText || t.recommendationText}</p></div>
        <button type="button" onClick={discussRecommendation}>{effectiveDefinition.actionLabel || t.discuss} →</button>
      </section>

      <form className="as6-canonical-space__intent" onSubmit={submitIntent}><label htmlFor={`intent-${effectiveDefinition.id}`}>{effectiveDefinition.intentLabel || t.intentLabel}</label><div><input id={`intent-${effectiveDefinition.id}`} value={intent} onChange={(event) => setIntent(event.target.value)} placeholder={effectiveDefinition.intentPlaceholder || t.intentPlaceholder} /><button type="submit" aria-label={t.discuss}>◎</button></div></form>
    </div>
  );
}
