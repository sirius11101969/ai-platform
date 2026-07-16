import React, { useMemo, useState } from "react";
import "./LivingSpaceEngine.css";

export default function LivingSpaceEngine({ definition, navigate }) {
  const [intent, setIntent] = useState("");
  const nodes = useMemo(() => definition.nodes || [], [definition]);
  const timeline = ["Понял задачу", "Нашёл контекст", "Проверил риски", "Подготовил решение", "Ожидает подтверждения"];

  return (
    <div className="as6-space-engine" data-space-engine={definition.id}>
      <header className="as6-space-engine__intro">
        <span className="as6-v2-eyebrow">{definition.label}</span>
        <h1>{definition.center}</h1>
        <p>{definition.subtitle}</p>
      </header>

      <section className="as6-space-engine__universe" aria-label={`${definition.label}: связанные контуры`}>
        <article className="as6-space-engine__core">
          <span>{definition.symbol}</span>
          <h2>{definition.center}</h2>
          <p>{definition.subtitle}</p>
          <strong>{definition.confidence}%</strong>
          <small>уверенность пространства</small>
        </article>
        {nodes.map((node, index) => (
          <button
            type="button"
            key={node}
            className={`as6-space-engine__node as6-space-engine__node--${index + 1}`}
            onClick={() => setIntent(`Покажи главное: ${node.toLowerCase()}`)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{node}</strong>
            <small>Открыть контекст</small>
          </button>
        ))}
      </section>

      <section className="as6-space-engine__timeline" aria-label="Ход мышления пространства">
        {timeline.map((step, index) => <span key={step} className={index < 4 ? "is-complete" : ""}><i />{step}</span>)}
      </section>

      <div className="as6-space-engine__lower">
        <article>
          <span className="as6-v2-eyebrow">Рекомендация пространства</span>
          <h2>{definition.recommendation}</h2>
          <button type="button" onClick={() => navigate("conductor")}>Обсудить с AI-дирижёром →</button>
        </article>
        <form onSubmit={(event) => { event.preventDefault(); navigate("conductor"); }}>
          <label htmlFor={`intent-${definition.id}`}>Что вы хотите узнать или изменить?</label>
          <div><input id={`intent-${definition.id}`} value={intent} onChange={(event) => setIntent(event.target.value)} placeholder={`Спросите о пространстве «${definition.label}»`} /><button type="submit">→</button></div>
        </form>
      </div>
    </div>
  );
}
