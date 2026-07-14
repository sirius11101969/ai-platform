import React, { useEffect, useMemo, useRef, useState } from "react";
import "./LivingShellV2.css";

const spaces = [
  { id: "home", path: "/app", label: "ÐÐ¾Ð¼", short: "ÐÐ»Ð°Ð²Ð½ÑÐ¹ ÑÐ¾ÐºÑÑ", symbol: "â" },
  { id: "conductor", path: "/app/conductor", label: "AI-Ð´Ð¸ÑÐ¸Ð¶ÑÑ", short: "ÐÐ°Ð¼ÐµÑÐµÐ½Ð¸Ðµ Ð¸ Ð¿Ð»Ð°Ð½", symbol: "â¦" },
  { id: "relations", path: "/app/relations", label: "ÐÐ»Ð¸ÐµÐ½ÑÑ", short: "ÐÑÐ½Ð¾ÑÐµÐ½Ð¸Ñ Ð¸ Ð²Ð½Ð¸Ð¼Ð°Ð½Ð¸Ðµ", symbol: "â" },
  { id: "projects", path: "/app/projects", label: "ÐÑÐ¾ÐµÐºÑÑ", short: "Ð ÐµÐ·ÑÐ»ÑÑÐ°ÑÑ Ð¸ Ð´Ð²Ð¸Ð¶ÐµÐ½Ð¸Ðµ", symbol: "â" },
  { id: "documents", path: "/app/documents", label: "ÐÐ¾ÐºÑÐ¼ÐµÐ½ÑÑ", short: "ÐÐ¾Ð½ÑÐµÐºÑÑ Ð¸ Ð¼Ð°ÑÐµÑÐ¸Ð°Ð»Ñ", symbol: "â¤" },
  { id: "knowledge", path: "/app/knowledge", label: "ÐÐ½Ð°Ð½Ð¸Ñ", short: "Ð ÐµÑÐµÐ½Ð¸Ñ Ð¸ Ð¿Ð°Ð¼ÑÑÑ", symbol: "â" },
  { id: "blog", path: "/app/blog", label: "ÐÐ»Ð¾Ð³", short: "ÐÐ´ÐµÐ¸ Ð² Ð´ÐµÐ¹ÑÑÐ²Ð¸Ð¸", symbol: "â«" },
  { id: "settings", path: "/app/settings", label: "ÐÐ°ÑÑÑÐ¾Ð¹ÐºÐ¸", short: "ÐÐ°ÑÐµ Ð¿ÑÐ¾ÑÑÑÐ°Ð½ÑÑÐ²Ð¾", symbol: "â" }
];

const commandItems = [
  { title: "ÐÑÐºÑÑÑÑ AI-Ð´Ð¸ÑÐ¸Ð¶ÑÑÐ°", hint: "Ð¡ÑÐ¾ÑÐ¼ÑÐ»Ð¸ÑÐ¾Ð²Ð°ÑÑ Ð½Ð°Ð¼ÐµÑÐµÐ½Ð¸Ðµ", target: "conductor" },
  { title: "ÐÐ°Ð¹ÑÐ¸ ÐºÐ»Ð¸ÐµÐ½ÑÐ°", hint: "ÐÐ¾Ð¸ÑÐº Ð¿Ð¾ Ð¾ÑÐ½Ð¾ÑÐµÐ½Ð¸ÑÐ¼", target: "relations" },
  { title: "ÐÑÐºÑÑÑÑ Ð¿ÑÐ¾ÐµÐºÑÑ", hint: "ÐÐ¾ÑÐ¼Ð¾ÑÑÐµÑÑ ÑÐµÐºÑÑÐµÐµ Ð´Ð²Ð¸Ð¶ÐµÐ½Ð¸Ðµ", target: "projects" },
  { title: "ÐÐ°Ð¹ÑÐ¸ Ð´Ð¾ÐºÑÐ¼ÐµÐ½Ñ", hint: "ÐÐ¾Ð¸ÑÐº Ð¿Ð¾ ÑÐ°Ð±Ð¾ÑÐ¸Ð¼ Ð¼Ð°ÑÐµÑÐ¸Ð°Ð»Ð°Ð¼", target: "documents" },
  { title: "ÐÑÐºÑÑÑÑ Ð·Ð½Ð°Ð½Ð¸Ñ", hint: "ÐÑÑÐ¾ÑÐ¸Ñ ÑÐµÑÐµÐ½Ð¸Ð¹ Ð¸ ÐºÐ¾Ð½ÑÐµÐºÑÑ", target: "knowledge" },
  { title: "ÐÑÐ¾ÑÐ¸ÑÐ°ÑÑ Living Blog", hint: "ÐÐ´ÐµÐ¸, ÐºÐ¾ÑÐ¾ÑÑÐµ Ð¼Ð¾Ð¶Ð½Ð¾ Ð¿ÑÐ¸Ð¼ÐµÐ½Ð¸ÑÑ", target: "blog" }
];

function resolveSpace(pathname) {
  const exact = spaces.find((space) => space.path === pathname);
  if (exact) return exact.id;

  const nested = spaces.find(
    (space) => space.path !== "/app" && pathname.startsWith(space.path)
  );

  return nested?.id || "home";
}

function BrandMark() {
  return (
    <span className="as6-v2-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function FocusCard({ onOpen }) {
  return (
    <article className="as6-v2-focus-card">
      <span className="as6-v2-eyebrow">ÐÐ»Ð°Ð²Ð½ÑÐ¹ ÑÐ¾ÐºÑÑ</span>
      <h2>Ð¡Ð¾Ð·Ð´Ð°ÑÑ ÑÐ¿Ð¾ÐºÐ¾Ð¹Ð½ÑÑ ÑÐ¸ÑÑÐµÐ¼Ñ ÑÐ¾ÑÑÐ° AS6.</h2>
      <p>
        ÐÑÐ¾ÑÑÑÐ°Ð½ÑÑÐ²Ð¾ ÑÐ¾Ð±ÑÐ°Ð»Ð¾ ÑÐµÐºÑÑÐ¸Ð¹ ÐºÐ¾Ð½ÑÐµÐºÑÑ. Ð¡Ð»ÐµÐ´ÑÑÑÐ¸Ð¹ ÑÐ°Ð·ÑÐ¼Ð½ÑÐ¹ ÑÐ°Ð³ â
        Ð¿ÑÐ¾Ð²ÐµÑÐ¸ÑÑ ÐºÐ»Ð¸ÐµÐ½ÑÑÐºÐ¸Ð¹ Ð¿ÑÑÑ Ð¸ Ð²ÑÐ±ÑÐ°ÑÑ Ð¾Ð´Ð½Ñ Ð·Ð°Ð´Ð°ÑÑ Ð´Ð»Ñ AI-Ð´Ð¸ÑÐ¸Ð¶ÑÑÐ°.
      </p>
      <button type="button" className="as6-v2-primary" onClick={onOpen}>
        <span>ÐÑÐ¾Ð´Ð¾Ð»Ð¶Ð¸ÑÑ Ñ AI</span>
        <b aria-hidden="true">â</b>
      </button>
    </article>
  );
}

function HomeState({ navigate }) {
  return (
    <div className="as6-v2-state-grid">
      <section className="as6-v2-hero">
        <span className="as6-v2-eyebrow">ÐÑÐ¾ÑÐ½Ð¸Ðº Â· Ð¿ÑÐ¾ÑÑÑÐ°Ð½ÑÑÐ²Ð¾ ÑÐ¿Ð¾ÐºÐ¾Ð¹Ð½Ð¾</span>
        <h1>ÐÐ´ÑÐ°Ð²ÑÑÐ²ÑÐ¹ÑÐµ, ÐÐ»Ð°Ð´Ð¸Ð¼Ð¸Ñ.</h1>
        <p>
          ÐÑÑ Ð²Ð°Ð¶Ð½Ð¾Ðµ ÑÐ¾Ð±ÑÐ°Ð½Ð¾ Ð·Ð´ÐµÑÑ. ÐÐµ Ð½ÑÐ¶Ð½Ð¾ Ð¸ÑÐºÐ°ÑÑ ÑÐ°Ð·Ð´ÐµÐ» â
          Ð½Ð°ÑÐ½Ð¸ÑÐµ Ñ Ð½Ð°Ð¼ÐµÑÐµÐ½Ð¸Ñ Ð¸Ð»Ð¸ Ð¿ÑÐ¾Ð´Ð¾Ð»Ð¶Ð¸ÑÐµ Ð³Ð»Ð°Ð²Ð½Ð¾Ðµ Ð´ÐµÐ¹ÑÑÐ²Ð¸Ðµ.
        </p>
      </section>

      <FocusCard onOpen={() => navigate("conductor")} />

      <article className="as6-v2-panel as6-v2-panel-wide">
        <header>
          <span className="as6-v2-eyebrow">Ð§ÑÐ¾ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ð»Ð¾ÑÑ</span>
          <button type="button" onClick={() => navigate("projects")}>ÐÑÐµ ÑÐ¾Ð±ÑÑÐ¸Ñ</button>
        </header>
        <div className="as6-v2-timeline">
          <div><i /><span><strong>Production Ð³Ð¾ÑÐ¾Ð²</strong><small>ÐÐ¾Ð½Ð¸ÑÐ¾ÑÐ¸Ð½Ð³ Ð¸ backup ÑÐ°Ð±Ð¾ÑÐ°ÑÑ Ð°Ð²ÑÐ¾Ð¼Ð°ÑÐ¸ÑÐµÑÐºÐ¸</small></span></div>
          <div><i /><span><strong>Living Space v2 Ð·Ð°ÑÐ¸ÐºÑÐ¸ÑÐ¾Ð²Ð°Ð½</strong><small>Blueprint Ð¸ Design System ÑÑÐ°Ð»Ð¸ ÐºÐ°Ð½Ð¾Ð½Ð¾Ð¼</small></span></div>
          <div><i /><span><strong>ÐÐµÐ·Ð¾Ð¿Ð°ÑÐ½Ð¾ÑÑÑ ÑÑÐ¸Ð»ÐµÐ½Ð°</strong><small>Ð£ÑÐ·Ð²Ð¸Ð¼Ð¾ÑÑÐ¸ backend ÑÑÑÑÐ°Ð½ÐµÐ½Ñ</small></span></div>
        </div>
      </article>

      <article className="as6-v2-panel">
        <span className="as6-v2-eyebrow">Ð¢ÑÐµÐ±ÑÐµÑ Ð²Ð½Ð¸Ð¼Ð°Ð½Ð¸Ñ</span>
        <strong className="as6-v2-large-number">3</strong>
        <p>Ð¾ÑÐ½Ð¾ÑÐµÐ½Ð¸Ñ, Ð³Ð´Ðµ ÑÐ»ÐµÐ´ÑÑÑÐ¸Ð¹ ÑÐ°Ð³ ÐµÑÑ Ð½Ðµ Ð¾Ð¿ÑÐµÐ´ÐµÐ»ÑÐ½</p>
        <button type="button" onClick={() => navigate("relations")}>ÐÐ¾ÑÐ¼Ð¾ÑÑÐµÑÑ ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð² â</button>
      </article>

      <article className="as6-v2-panel">
        <span className="as6-v2-eyebrow">ÐÐ½Ð°Ð½Ð¸Ðµ Ð´Ð½Ñ</span>
        <h3>ÐÑÐ¾ÑÑÐ¾ÑÐ° â ÑÑÐ¾ Ð¾ÑÑÑÑÑÑÐ²Ð¸Ðµ Ð»Ð¸ÑÐ½ÐµÐ³Ð¾ ÑÐµÑÐµÐ½Ð¸Ñ.</h3>
        <p>AS6 Ð´Ð¾Ð»Ð¶ÐµÐ½ Ð¿Ð¾Ð´ÑÐºÐ°Ð·ÑÐ²Ð°ÑÑ Ð¾Ð´Ð½Ð¾ Ð¿Ð¾Ð½ÑÑÐ½Ð¾Ðµ Ð´ÐµÐ¹ÑÑÐ²Ð¸Ðµ Ð²Ð¼ÐµÑÑÐ¾ ÑÐ¿Ð¸ÑÐºÐ° ÑÑÐ½ÐºÑÐ¸Ð¹.</p>
        <button type="button" onClick={() => navigate("knowledge")}>ÐÑÐºÑÑÑÑ ÐºÐ¾Ð½ÑÐµÐºÑÑ â</button>
      </article>
    </div>
  );
}

function ConductorState() {
  const [intent, setIntent] = useState("");
  const [plan, setPlan] = useState(null);

  function submit(event) {
    event.preventDefault();
    const normalized = intent.trim();
    if (!normalized) return;

    setPlan({
      intent: normalized,
      steps: [
        "Ð¡Ð¾Ð±ÑÐ°ÑÑ Ð´Ð¾ÑÑÑÐ¿Ð½ÑÐ¹ ÐºÐ¾Ð½ÑÐµÐºÑÑ",
        "ÐÐ¾ÐºÐ°Ð·Ð°ÑÑ Ð±ÐµÐ·Ð¾Ð¿Ð°ÑÐ½ÑÐ¹ Ð¿Ð»Ð°Ð½",
        "ÐÐ°Ð¿ÑÐ¾ÑÐ¸ÑÑ Ð¿Ð¾Ð´ÑÐ²ÐµÑÐ¶Ð´ÐµÐ½Ð¸Ðµ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ð¹"
      ]
    });
  }

  return (
    <div className="as6-v2-conductor">
      <section className="as6-v2-hero as6-v2-hero-centered">
        <span className="as6-v2-eyebrow">AI-Ð´Ð¸ÑÐ¸Ð¶ÑÑ</span>
        <h1>Ð§ÑÐ¾ Ð´Ð¾Ð»Ð¶Ð½Ð¾ Ð¸Ð·Ð¼ÐµÐ½Ð¸ÑÑÑÑ?</h1>
        <p>ÐÐ¿Ð¸ÑÐ¸ÑÐµ ÑÐµÐ·ÑÐ»ÑÑÐ°Ñ Ð¾Ð±ÑÑÐ½ÑÐ¼Ð¸ ÑÐ»Ð¾Ð²Ð°Ð¼Ð¸. AS6 ÑÐ½Ð°ÑÐ°Ð»Ð° Ð¿Ð¾ÐºÐ°Ð¶ÐµÑ Ð¿Ð»Ð°Ð½ Ð¸ Ð½Ð¸ÑÐµÐ³Ð¾ Ð½Ðµ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ñ Ð±ÐµÐ· Ð¿Ð¾Ð´ÑÐ²ÐµÑÐ¶Ð´ÐµÐ½Ð¸Ñ.</p>
      </section>

      <form className="as6-v2-intent" onSubmit={submit}>
        <textarea
          value={intent}
          onChange={(event) => setIntent(event.target.value)}
          placeholder="ÐÐ°Ð¿ÑÐ¸Ð¼ÐµÑ: Ð½Ð°Ð¹Ð´Ð¸ ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð², ÐºÐ¾ÑÐ¾ÑÑÐ¼ Ð¼Ñ Ð´Ð°Ð²Ð½Ð¾ Ð½Ðµ Ð¾ÑÐ²ÐµÑÐ°Ð»Ð¸, Ð¸ Ð¿ÑÐµÐ´Ð»Ð¾Ð¶Ð¸ ÑÐ»ÐµÐ´ÑÑÑÐ¸Ð¹ ÑÐ°Ð³"
          aria-label="ÐÐ°Ð¼ÐµÑÐµÐ½Ð¸Ðµ Ð´Ð»Ñ AI-Ð´Ð¸ÑÐ¸Ð¶ÑÑÐ°"
        />
        <button type="submit" className="as6-v2-primary">
          <span>Ð¡Ð¾Ð±ÑÐ°ÑÑ Ð¿Ð»Ð°Ð½</span>
          <b aria-hidden="true">â</b>
        </button>
      </form>

      {plan ? (
        <article className="as6-v2-plan">
          <span className="as6-v2-eyebrow">AS6 Ð¿Ð¾Ð½ÑÐ» Ð½Ð°Ð¼ÐµÑÐµÐ½Ð¸Ðµ</span>
          <h2>{plan.intent}</h2>
          <ol>
            {plan.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <div className="as6-v2-plan-actions">
            <button type="button" className="as6-v2-primary">ÐÐ¾Ð´ÑÐ²ÐµÑÐ´Ð¸ÑÑ Ð¿Ð»Ð°Ð½</button>
            <button type="button" className="as6-v2-secondary" onClick={() => setPlan(null)}>Ð£ÑÐ¾ÑÐ½Ð¸ÑÑ</button>
          </div>
          <small>ÐÑÐ¾ÑÐ¾ÑÐ¸Ð¿: ÑÐµÐ°Ð»ÑÐ½ÑÐµ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ñ Ð´Ð°Ð½Ð½ÑÑ Ð¾ÑÐºÐ»ÑÑÐµÐ½Ñ.</small>
        </article>
      ) : (
        <div className="as6-v2-suggestions">
          {[
            "Ð§ÑÐ¾ ÑÐµÐ¹ÑÐ°Ñ Ð²Ð°Ð¶Ð½ÐµÐµ Ð²ÑÐµÐ³Ð¾?",
            "ÐÐ¾ÐºÐ°Ð¶Ð¸ ÑÐ¸ÑÐºÐ¸ Ð¿Ð¾ ÐºÐ»Ð¸ÐµÐ½ÑÐ°Ð¼",
            "Ð¡Ð¾Ð±ÐµÑÐ¸ Ð¿Ð»Ð°Ð½ ÑÐ°Ð·Ð²Ð¸ÑÐ¸Ñ Ð¿ÑÐ¾Ð´ÑÐºÑÐ°"
          ].map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => setIntent(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const relationRows = [
  ["Ð¡ÐµÐ²ÐµÑÐ½ÑÐ¹ Ð²ÐµÑÐµÑ", "ÐÑÐ¶ÐµÐ½ Ð¾ÑÐ²ÐµÑ", "2 Ð´Ð½Ñ", "ÐÐ¾Ð´Ð³Ð¾ÑÐ¾Ð²Ð¸ÑÑ ÐºÐ¾ÑÐ¾ÑÐºÐ¾Ðµ Ð¿ÑÐ¾Ð´Ð¾Ð»Ð¶ÐµÐ½Ð¸Ðµ"],
  ["ÐÐ»ÑÑÐ° ÐÑÐ¾ÐµÐºÑ", "Ð ÐµÑÐµÐ½Ð¸Ðµ Ð¾ÑÐ»Ð¾Ð¶ÐµÐ½Ð¾", "5 Ð´Ð½ÐµÐ¹", "Ð£ÑÐ¾ÑÐ½Ð¸ÑÑ ÐºÑÐ¸ÑÐµÑÐ¸Ð¸ Ð²ÑÐ±Ð¾ÑÐ°"],
  ["ÐÐ¾Ð²Ð°Ñ Ð»Ð¸Ð½Ð¸Ñ", "Ð¥Ð¾ÑÐ¾ÑÐ¸Ð¹ Ð¼Ð¾Ð¼ÐµÐ½Ñ", "Ð¡ÐµÐ³Ð¾Ð´Ð½Ñ", "ÐÑÐµÐ´Ð»Ð¾Ð¶Ð¸ÑÑ ÑÐ»ÐµÐ´ÑÑÑÐ¸Ð¹ ÑÐ°Ð³"]
];

function RelationsState() {
  return (
    <div className="as6-v2-state">
      <section className="as6-v2-hero">
        <span className="as6-v2-eyebrow">Living CRM</span>
        <h1>ÐÑÐ½Ð¾ÑÐµÐ½Ð¸Ñ, ÐºÐ¾ÑÐ¾ÑÑÐ¼ Ð½ÑÐ¶Ð½Ð¾ Ð²Ð½Ð¸Ð¼Ð°Ð½Ð¸Ðµ.</h1>
        <p>ÐÐµ ÑÐ°Ð±Ð»Ð¸ÑÐ° ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð², Ð° Ð¿ÑÐ¸ÑÐ¸Ð½Ñ, ÑÐ¸ÑÐºÐ¸ Ð¸ ÑÐ»ÐµÐ´ÑÑÑÐµÐµ Ð¿Ð¾Ð½ÑÑÐ½Ð¾Ðµ Ð´ÐµÐ¹ÑÑÐ²Ð¸Ðµ.</p>
      </section>
      <div className="as6-v2-list">
        {relationRows.map(([name, status, time, action]) => (
          <article key={name}>
            <span className="as6-v2-node"><i /></span>
            <div><h3>{name}</h3><p>{status} Â· {time}</p></div>
            <strong>{action}</strong>
            <button type="button" aria-label={`ÐÑÐºÑÑÑÑ ${name}`}>â</button>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProjectsState() {
  return (
    <div className="as6-v2-state">
      <section className="as6-v2-hero">
        <span className="as6-v2-eyebrow">ÐÑÐ¾ÐµÐºÑÑ</span>
        <h1>ÐÐ²Ð¸Ð¶ÐµÐ½Ð¸Ðµ Ðº ÑÐµÐ·ÑÐ»ÑÑÐ°ÑÑ.</h1>
        <p>ÐÐ°Ð¶Ð´ÑÐ¹ Ð¿ÑÐ¾ÐµÐºÑ Ð¿Ð¾ÐºÐ°Ð·ÑÐ²Ð°ÐµÑ ÑÑÐ°Ð¿, Ð¿ÑÐµÐ¿ÑÑÑÑÐ²Ð¸Ðµ Ð¸ Ð±Ð»Ð¸Ð¶Ð°Ð¹ÑÐµÐµ Ð´ÐµÐ¹ÑÑÐ²Ð¸Ðµ.</p>
      </section>
      <div className="as6-v2-card-grid">
        {[
          ["Living Space v2", "ÐÑÐ¾ÑÐ¾ÑÐ¸Ð¿ Ð¾Ð±Ð¾Ð»Ð¾ÑÐºÐ¸", "78%", "Ð£ÑÐ²ÐµÑÐ´Ð¸ÑÑ Ð³Ð»Ð°Ð²Ð½ÑÐ¹ ÑÐºÑÐ°Ð½"],
          ["ÐÑÐ±Ð»Ð¸ÑÐ½ÑÐ¹ ÑÐ°Ð¹Ñ", "ÐÐ¾Ð²ÑÐ¹ Ð±ÑÐµÐ½Ð´ Ð¾Ð¿ÑÐ±Ð»Ð¸ÐºÐ¾Ð²Ð°Ð½", "92%", "Ð Ð°ÑÑÐ¸ÑÐ¸ÑÑ Living Blog"],
          ["AI-Ð´Ð¸ÑÐ¸Ð¶ÑÑ", "ÐÐ¾Ð½ÑÑÐ°ÐºÑ Ð²Ð·Ð°Ð¸Ð¼Ð¾Ð´ÐµÐ¹ÑÑÐ²Ð¸Ñ", "46%", "ÐÐ¾Ð´ÐºÐ»ÑÑÐ¸ÑÑ Ð±ÐµÐ·Ð¾Ð¿Ð°ÑÐ½ÑÐµ Ð´ÐµÐ¹ÑÑÐ²Ð¸Ñ"]
        ].map(([title, stage, progress, next]) => (
          <article className="as6-v2-project" key={title}>
            <span className="as6-v2-eyebrow">{stage}</span>
            <h2>{title}</h2>
            <div className="as6-v2-progress"><i style={{ width: progress }} /></div>
            <small>{progress} Ð³Ð¾ÑÐ¾Ð²Ð¾</small>
            <p>Ð¡Ð»ÐµÐ´ÑÑÑÐµÐµ: {next}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function LibraryState({ type }) {
  const content = type === "documents"
    ? {
        eyebrow: "ÐÐ¾ÐºÑÐ¼ÐµÐ½ÑÑ",
        title: "ÐÐ°ÑÐµÑÐ¸Ð°Ð»Ñ Ð² ÑÐ°Ð±Ð¾ÑÐµÐ¼ ÐºÐ¾Ð½ÑÐµÐºÑÑÐµ.",
        description: "ÐÐ¾ÐºÑÐ¼ÐµÐ½Ñ ÑÐ²ÑÐ·Ð°Ð½ Ñ Ð¿ÑÐ¾ÐµÐºÑÐ¾Ð¼, ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð¼, ÑÐµÑÐµÐ½Ð¸ÐµÐ¼ Ð¸ Ð¸ÑÑÐ¾ÑÐ¸ÐµÐ¹.",
        items: ["Living Space v2 Blueprint", "Production Readiness", "AS6 Design System"]
      }
    : {
        eyebrow: "ÐÐ½Ð°Ð½Ð¸Ñ",
        title: "ÐÐ°Ð¼ÑÑÑ ÑÐµÑÐµÐ½Ð¸Ð¹ AS6.",
        description: "ÐÐ´ÐµÑÑ ÑÐ¾Ð±ÑÐ°Ð½Ñ Ð¾Ð±ÑÑÑÐ½ÐµÐ½Ð¸Ñ, ÑÑÐ°Ð½Ð´Ð°ÑÑÑ Ð¸ Ð¾Ð¿ÑÑ, ÐºÐ¾ÑÐ¾ÑÑÐ¹ Ð¿Ð¾Ð¼Ð¾Ð³Ð°ÐµÑ Ð´ÐµÐ¹ÑÑÐ²Ð¾Ð²Ð°ÑÑ.",
        items: ["ÐÐ¾ÑÐµÐ¼Ñ AS6 â Ð¾Ð´Ð½Ð¾ Ð¿ÑÐ¾ÑÑÑÐ°Ð½ÑÑÐ²Ð¾", "Diagnostics First", "ÐÑÐ¸Ð½ÑÐ¸Ð¿Ñ ÑÐ¿Ð¾ÐºÐ¾Ð¹Ð½Ð¾Ð³Ð¾ Ð¸Ð½ÑÐµÑÑÐµÐ¹ÑÐ°"]
      };

  return (
    <div className="as6-v2-state">
      <section className="as6-v2-hero">
        <span className="as6-v2-eyebrow">{content.eyebrow}</span>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
      </section>
      <div className="as6-v2-library">
        {content.items.map((item, index) => (
          <button type="button" key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item}</strong>
            <small>ÐÑÐºÑÑÑÑ Ð² Ð¿ÑÐ¾ÑÑÑÐ°Ð½ÑÑÐ²Ðµ</small>
            <b>â</b>
          </button>
        ))}
      </div>
    </div>
  );
}

function BlogState() {
  return (
    <div className="as6-v2-state">
      <section className="as6-v2-hero">
        <span className="as6-v2-eyebrow">Living Blog</span>
        <h1>ÐÐ´ÐµÐ¸, ÐºÐ¾ÑÐ¾ÑÑÐµ Ð¿ÑÐµÐ²ÑÐ°ÑÐ°ÑÑÑÑ Ð² Ð´ÐµÐ¹ÑÑÐ²Ð¸Ñ.</h1>
        <p>ÐÐ¾ÑÐ»Ðµ ÑÑÐµÐ½Ð¸Ñ Ð¼Ð°ÑÐµÑÐ¸Ð°Ð» Ð¼Ð¾Ð¶Ð½Ð¾ ÑÐ¾ÑÑÐ°Ð½Ð¸ÑÑ, Ð¾Ð±ÑÑÐ´Ð¸ÑÑ Ñ AI Ð¸Ð»Ð¸ Ð´Ð¾Ð±Ð°Ð²Ð¸ÑÑ Ð² Ð¿ÑÐ¾ÐµÐºÑ.</p>
      </section>
      <div className="as6-v2-card-grid">
        {[
          ["ÐÑÐ¾Ð´ÑÐºÑ Ð±ÐµÐ· Ð»Ð¸ÑÐ½ÐµÐ¹ Ð½Ð°Ð²Ð¸Ð³Ð°ÑÐ¸Ð¸", "7 Ð¼Ð¸Ð½ÑÑ"],
          ["ÐÐ°Ðº AI ÑÑÐ°Ð½Ð¾Ð²Ð¸ÑÑÑ Ð´Ð¸ÑÐ¸Ð¶ÑÑÐ¾Ð¼", "9 Ð¼Ð¸Ð½ÑÑ"],
          ["Ð¡Ð¿Ð¾ÐºÐ¾Ð¹Ð½ÑÐ¹ Ð±Ð¸Ð·Ð½ÐµÑ ÐºÐ°Ðº ÑÐ¸ÑÑÐµÐ¼Ð°", "6 Ð¼Ð¸Ð½ÑÑ"]
        ].map(([title, time]) => (
          <article className="as6-v2-article" key={title}>
            <span className="as6-v2-eyebrow">{time}</span>
            <h2>{title}</h2>
            <p>ÐÐ¾ÑÐ¾ÑÐºÐ¸Ð¹ Ð¿ÑÐ°ÐºÑÐ¸ÑÐµÑÐºÐ¸Ð¹ Ð¼Ð°ÑÐµÑÐ¸Ð°Ð», ÑÐ²ÑÐ·Ð°Ð½Ð½ÑÐ¹ Ñ ÑÐ°Ð·Ð²Ð¸ÑÐ¸ÐµÐ¼ AS6.</p>
            <button type="button">ÐÑÐ¾ÑÐ¸ÑÐ°ÑÑ Ð¸ Ð¿ÑÐ¸Ð¼ÐµÐ½Ð¸ÑÑ â</button>
          </article>
        ))}
      </div>
    </div>
  );
}

function SettingsState() {
  return (
    <div className="as6-v2-state">
      <section className="as6-v2-hero">
        <span className="as6-v2-eyebrow">ÐÐ°ÑÑÑÐ¾Ð¹ÐºÐ¸ Ð¿ÑÐ¾ÑÑÑÐ°Ð½ÑÑÐ²Ð°</span>
        <h1>AS6 ÑÐ°Ð±Ð¾ÑÐ°ÐµÑ Ð² Ð²Ð°ÑÐµÐ¼ ÑÐ¸ÑÐ¼Ðµ.</h1>
        <p>Ð¢Ð¾Ð»ÑÐºÐ¾ Ð¿Ð¾Ð½ÑÑÐ½ÑÐµ Ð½Ð°ÑÑÑÐ¾Ð¹ÐºÐ¸, ÐºÐ¾ÑÐ¾ÑÑÐµ Ð´ÐµÐ¹ÑÑÐ²Ð¸ÑÐµÐ»ÑÐ½Ð¾ Ð²Ð»Ð¸ÑÑÑ Ð½Ð° ÑÐ°Ð±Ð¾ÑÑ.</p>
      </section>
      <div className="as6-v2-settings">
        {[
          ["Ð¡Ð¿Ð¾ÐºÐ¾Ð¹Ð½ÑÐ¹ ÑÐµÐ¶Ð¸Ð¼", "ÐÐ¾ÐºÐ°Ð·ÑÐ²Ð°ÑÑ ÑÐ¾Ð»ÑÐºÐ¾ Ð³Ð»Ð°Ð²Ð½Ð¾Ðµ", true],
          ["ÐÐ¾Ð´ÑÐ²ÐµÑÐ¶Ð´ÐµÐ½Ð¸Ðµ AI", "ÐÑÐµÐ³Ð´Ð° ÑÐ¿ÑÐ°ÑÐ¸Ð²Ð°ÑÑ Ð¿ÐµÑÐµÐ´ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸ÐµÐ¼ Ð´Ð°Ð½Ð½ÑÑ", true],
          ["Ð£ÑÑÐµÐ½Ð½Ð¸Ð¹ ÑÐ¾ÐºÑÑ", "Ð¡Ð¾Ð±Ð¸ÑÐ°ÑÑ Ð¾Ð´Ð½Ð¾ Ð³Ð»Ð°Ð²Ð½Ð¾Ðµ Ð´ÐµÐ¹ÑÑÐ²Ð¸Ðµ Ð½Ð° Ð´ÐµÐ½Ñ", false]
        ].map(([title, text, enabled]) => (
          <label key={title}>
            <span><strong>{title}</strong><small>{text}</small></span>
            <input type="checkbox" defaultChecked={enabled} />
            <i />
          </label>
        ))}
      </div>
    </div>
  );
}

function ActiveState({ id, navigate }) {
  if (id === "conductor") return <ConductorState />;
  if (id === "relations") return <RelationsState />;
  if (id === "projects") return <ProjectsState />;
  if (id === "documents" || id === "knowledge") return <LibraryState type={id} />;
  if (id === "blog") return <BlogState />;
  if (id === "settings") return <SettingsState />;
  return <HomeState navigate={navigate} />;
}

export default function LivingShellV2() {
  const [activeId, setActiveId] = useState(() => resolveSpace(window.location.pathname));
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");
  const commandInputRef = useRef(null);

  const activeSpace = useMemo(
    () => spaces.find((space) => space.id === activeId) || spaces[0],
    [activeId]
  );

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commandItems;
    return commandItems.filter((item) =>
      `${item.title} ${item.hint}`.toLowerCase().includes(normalized)
    );
  }, [query]);

  function navigate(id) {
    const target = spaces.find((space) => space.id === id) || spaces[0];
    window.history.pushState({ as6Space: id }, "", target.path);
    setActiveId(id);
    setCommandOpen(false);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    function onPopState() {
      setActiveId(resolveSpace(window.location.pathname));
    }

    function onKeyDown(event) {
      const isCommand = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (isCommand) {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
      if (event.key === "Escape") setCommandOpen(false);
    }

    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (commandOpen) window.setTimeout(() => commandInputRef.current?.focus(), 30);
  }, [commandOpen]);

  return (
    <div className="as6-v2-shell" data-as6-product="living-space-v2" data-active-space={activeId}>
      <div className="as6-v2-atmosphere" aria-hidden="true" />
      <div className="as6-v2-stars" aria-hidden="true" />

      <aside className="as6-v2-sidebar">
        <a href="/" className="as6-v2-brand" aria-label="AS6 â Ð³Ð»Ð°Ð²Ð½Ð°Ñ">
          <BrandMark />
          <span><strong>AS6</strong><small>ÐÐ¸Ð²Ð¾Ðµ Ð¿ÑÐ¾ÑÑÑÐ°Ð½ÑÑÐ²Ð¾</small></span>
        </a>

        <nav aria-label="Ð¡Ð¾ÑÑÐ¾ÑÐ½Ð¸Ñ Living Space">
          {spaces.map((space) => (
            <button
              type="button"
              key={space.id}
              className={space.id === activeId ? "is-active" : ""}
              aria-current={space.id === activeId ? "page" : undefined}
              onClick={() => navigate(space.id)}
            >
              <span className="as6-v2-nav-symbol">{space.symbol}</span>
              <span><strong>{space.label}</strong><small>{space.short}</small></span>
            </button>
          ))}
        </nav>

        <div className="as6-v2-sidebar-footer">
          <span className="as6-v2-system-dot" />
          <span><strong>Ð¡Ð¸ÑÑÐµÐ¼Ð° ÑÐ¿Ð¾ÐºÐ¾Ð¹Ð½Ð°</strong><small>ÐÑÐµ ÐºÐ¾Ð½ÑÑÑÑ ÑÐ°Ð±Ð¾ÑÐ°ÑÑ</small></span>
        </div>
      </aside>

      <main className="as6-v2-main">
        <header className="as6-v2-topbar">
          <div>
            <span className="as6-v2-eyebrow">Ð¢ÐµÐºÑÑÐµÐµ Ð¿ÑÐ¾ÑÑÑÐ°Ð½ÑÑÐ²Ð¾</span>
            <strong>{activeSpace.label}</strong>
          </div>

          <button type="button" className="as6-v2-search-trigger" onClick={() => setCommandOpen(true)}>
            <span>ÐÐ°Ð¹ÑÐ¸ Ð¸Ð»Ð¸ ÑÐ´ÐµÐ»Ð°ÑÑ ÑÑÐ¾-ÑÐ¾â¦</span>
            <kbd>Ctrl K</kbd>
          </button>

          <button type="button" className="as6-v2-profile" aria-label="ÐÑÐ¾ÑÐ¸Ð»Ñ ÐÐ»Ð°Ð´Ð¸Ð¼Ð¸ÑÐ°">
            <span>Ð</span>
            <i />
          </button>
        </header>

        <div className="as6-v2-canvas">
          <ActiveState id={activeId} navigate={navigate} />
        </div>
      </main>

      {commandOpen && (
        <div className="as6-v2-command-layer" role="presentation" onMouseDown={() => setCommandOpen(false)}>
          <section
            className="as6-v2-command"
            role="dialog"
            aria-modal="true"
            aria-label="Ð£Ð½Ð¸Ð²ÐµÑÑÐ°Ð»ÑÐ½Ð°Ñ ÐºÐ¾Ð¼Ð°Ð½Ð´Ð° AS6"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <BrandMark />
              <input
                ref={commandInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ÐÐ°Ð¹ÑÐ¸, Ð¾ÑÐºÑÑÑÑ, ÑÐ¾Ð·Ð´Ð°ÑÑ Ð¸Ð»Ð¸ Ð¿ÑÐ¾Ð°Ð½Ð°Ð»Ð¸Ð·Ð¸ÑÐ¾Ð²Ð°ÑÑâ¦"
                aria-label="ÐÐ¾Ð¸ÑÐº ÐºÐ¾Ð¼Ð°Ð½Ð´"
              />
              <kbd>Esc</kbd>
            </header>

            <div className="as6-v2-command-results">
              <span className="as6-v2-eyebrow">ÐÑÐµÐ´Ð»Ð¾Ð¶ÐµÐ½Ð¸Ñ</span>
              {filteredCommands.map((item) => (
                <button type="button" key={item.title} onClick={() => navigate(item.target)}>
                  <span><strong>{item.title}</strong><small>{item.hint}</small></span>
                  <b>â</b>
                </button>
              ))}
              {!filteredCommands.length && (
                <p>ÐÐ¸ÑÐµÐ³Ð¾ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ð¾. Ð¡ÑÐ¾ÑÐ¼ÑÐ»Ð¸ÑÑÐ¹ÑÐµ Ð½Ð°Ð¼ÐµÑÐµÐ½Ð¸Ðµ Ð¸Ð½Ð°ÑÐµ.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
