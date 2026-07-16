import React, { useMemo, useState } from "react";
import "./LivingSpaceEngine.css";

const fallbackSteps = ["Понял задачу", "Нашёл данные", "Проверил связи", "Подготовил решение", "Ожидает подтверждения"];

export default function LivingSpaceEngine({ definition, navigate }) {
  const [intent, setIntent] = useState("");
  const nodes = useMemo(() => definition.nodes || [], [definition]);
  const events = definition.events || [];
  const insights = definition.insights || [];
  const steps = definition.steps || fallbackSteps;
  const confidence = Number(definition.confidence || 0);

  function submitIntent(event) {
    event.preventDefault();
    if (typeof definition.onIntent === "function") definition.onIntent(intent);
    navigate("conductor");
  }

  return (
    <div className="as6-canonical-space" data-space-engine="canonical-v2" data-space-id={definition.id}>
      <aside className="as6-canonical-space__left" aria-label="Контекст пространства">
        <header><span>{definition.greeting || "Доброе утро, Владимир."}</span><p>{definition.context || definition.subtitle}</p></header>
        <div className="as6-canonical-space__insights">
          {insights.map((item) => <article key={item.label}><i aria-hidden="true" /><div><strong>{item.value}</strong><span>{item.label}</span></div></article>)}
        </div>
      </aside>

      <main className="as6-canonical-space__main">
        <header className="as6-canonical-space__title"><h1>{definition.label}</h1><p>{definition.spaceTitle || definition.subtitle}</p></header>
        <section className="as6-canonical-space__universe" aria-label={`${definition.label}: живая карта`}>
          <div className="as6-canonical-space__mesh" aria-hidden="true" />
          <article className="as6-canonical-space__core">
            <span>{definition.symbol}</span><h2>{definition.center}</h2><small>{definition.coreLabel || "Центр понимания"}</small><p>{definition.coreText || definition.subtitle}</p>
          </article>
          {nodes.slice(0, 7).map((node, index) => {
            const item = typeof node === "string" ? { label: node } : node;
            return <button type="button" key={`${item.label}-${index}`} className={`as6-canonical-space__node as6-canonical-space__node--${index + 1}`} onClick={() => setIntent(`Покажи главное: ${item.label.toLowerCase()}`)}><strong>{item.label}</strong><span>{item.value || item.meta || "Открыть контекст"}</span><small>{item.note || "Связано с пространством"}</small></button>;
          })}
        </section>
      </main>

      <aside className="as6-canonical-space__right" aria-label="События пространства">
        <header><h2>{definition.activityTitle || "Что происходит сейчас"}</h2><p>{definition.activitySubtitle || "Живые события и обновления"}</p></header>
        <div className="as6-canonical-space__events">
          {(events.length ? events : [{ time: "Сейчас", text: definition.emptyActivity || "Пространство спокойно. Новых событий нет." }]).map((event, index) => <article key={`${event.time}-${index}`}><i /><time>{event.time}</time><p>{event.text}</p></article>)}
        </div>
        <section className="as6-canonical-space__confidence"><span>Состояние пространства</span><strong>{confidence}%</strong><small>{definition.confidenceNote || "Система использует только подтверждённые данные"}</small></section>
      </aside>

      <section className="as6-canonical-space__path" aria-label="Путь работы пространства">
        <span>{definition.pathTitle || "Мышление пространства"}</span><div>{steps.map((step, index) => <article key={step} className={index < Math.max(1, steps.length - 1) ? "is-complete" : ""}><i /><small>{step}</small></article>)}</div>
      </section>

      <section className="as6-canonical-space__recommendation">
        <div><span>Рекомендация дня</span><h2>{definition.recommendation}</h2><p>{definition.recommendationText || "AS6 собрал подтверждённый контекст и показывает одно полезное действие."}</p></div>
        <button type="button" onClick={() => navigate("conductor")}>{definition.actionLabel || "Обсудить с AI"} →</button>
      </section>

      <form className="as6-canonical-space__intent" onSubmit={submitIntent}><label htmlFor={`intent-${definition.id}`}>{definition.intentLabel || "Расскажите, что вы хотите получить."}</label><div><input id={`intent-${definition.id}`} value={intent} onChange={(event) => setIntent(event.target.value)} placeholder={definition.intentPlaceholder || `Что вы хотите узнать о пространстве «${definition.label}»?`} /><button type="submit" aria-label="Передать намерение AI">◎</button></div></form>
    </div>
  );
}
