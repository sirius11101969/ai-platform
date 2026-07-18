import React, { useEffect, useMemo, useState } from "react";
import "./AS6MasterScreen.css";
import "./AS6MasterScreenPolish.css";
import "./AS6MasterScreenReference.css";

const spaces = [
  { id: "sales", label: "Продажи", note: "Прогноз подтверждён", x: 20, y: 20 },
  { id: "relations", label: "CRM", note: "Контакты проверены", x: 50, y: 12 },
  { id: "marketing", label: "Маркетинг", note: "Ожидает решение", x: 77, y: 25 },
  { id: "finance", label: "Финансы", note: "Проверяет риски", x: 16, y: 58 },
  { id: "documents", label: "Документы", note: "Обновляют версию", x: 10, y: 84 },
  { id: "team", label: "Команда", note: "Материалы согласованы", x: 83, y: 73 },
];

// Every connection represents a real business dependency. The active chain reflects
// the work AS6 is doing now: Finance → Documents → Team.
const connections = [
  { id: "crm-sales", from: "relations", to: "sales", kind: "structural", d: "M50 12 C40 8 29 10 20 20" },
  { id: "sales-finance", from: "sales", to: "finance", kind: "structural", d: "M20 20 C13 31 12 46 16 58" },
  { id: "crm-marketing", from: "relations", to: "marketing", kind: "structural", d: "M50 12 C61 8 70 14 77 25" },
  { id: "marketing-team", from: "marketing", to: "team", kind: "structural", d: "M77 25 C88 38 88 59 83 73" },
  { id: "finance-documents", from: "finance", to: "documents", kind: "active", d: "M16 58 C11 66 9 76 10 84" },
  { id: "documents-team", from: "documents", to: "team", kind: "active", d: "M10 84 C29 94 62 91 83 73" },
  { id: "finance-team", from: "finance", to: "team", kind: "active", d: "M16 58 C35 48 58 82 83 73" },
];

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

function formatTime() {
  return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function formatDate() {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date());
}

export default function AS6MasterScreen({ navigate, profileName = "Владимир" }) {
  const [intent, setIntent] = useState("Проверить прогноз перед отправкой инвестору…");
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [activeSpace, setActiveSpace] = useState(null);
  const [calmMode, setCalmMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const time = useMemo(formatTime, [now]);
  const date = useMemo(formatDate, [now]);
  const activeSpaceData = spaces.find((space) => space.id === activeSpace);

  function submitIntent(event) {
    event.preventDefault();
    if (!intent.trim()) return;
    navigate?.("conductor");
  }

  return (
    <section className={`as6-master${calmMode ? " is-calm" : ""}${listening ? " is-listening" : ""}`} aria-label="AS6 — Сегодня">
      <div className="as6-master__ambient" aria-hidden="true" />

      <div className="as6-master__canvas">
        <header className="as6-master__topbar">
          <div className="as6-master__today">
            <h1>Сегодня</h1>
            <p className="as6-master__overnight">AS6 самостоятельно выполнил 17 действий и нашёл способ повысить вероятность успеха встречи.</p>
          </div>
          <div className="as6-master__utilities" aria-label="Настройки рабочего пространства">
            <span>RU</span><span>EN</span>
            <button type="button" aria-label="Светлая тема">☼</button>
            <button type="button" aria-label="Спокойный режим" aria-pressed={calmMode} onClick={() => setCalmMode((value) => !value)}>☾</button>
            <button type="button" aria-label="Настройки">⚙</button>
            <time dateTime={now.toISOString()}><strong>{time}</strong><small>{date}</small></time>
            <button type="button" aria-label="Погода">☼</button><span>24°</span>
          </div>
        </header>

        <main className="as6-master__space">
          <svg className="as6-master__graph" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <filter id="as6-soft-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="0.55" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <g className="as6-master__graph-lines">
              {connections.map((connection) => {
                const related = activeSpace && (connection.from === activeSpace || connection.to === activeSpace);
                const muted = activeSpace && !related;
                return <path key={connection.id} className={`is-${connection.kind}${related ? " is-related" : ""}${muted ? " is-muted" : ""}`} d={connection.d} />;
              })}
            </g>
            <g className="as6-master__graph-points">{graphPoints.map(([cx, cy], index) => <circle key={`${cx}-${cy}-${index}`} cx={cx} cy={cy} r={index < 6 ? 0.48 : 0.30} />)}</g>
          </svg>

          {spaces.map((space) => {
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

          <article className="as6-master__focus">
            <span className="as6-master__focus-kicker">Главная цель</span>
            <h2>Подготовить компанию к встрече с инвестором</h2>
            <div className="as6-master__thinking" aria-live="polite">
              <span className="as6-master__thinking-dot" aria-hidden="true" />
              <div><small>AS6 сейчас</small><strong>Проверяет финансовый прогноз</strong></div>
            </div>
            <div className="as6-master__outcome">
              <span>Вероятность успешной встречи</span>
              <strong>92%</strong>
              <small>↑ 3% после завершения проверки</small>
            </div>
          </article>
          <p className="as6-master__space-status" aria-live="polite">{activeSpaceData ? `${activeSpaceData.label}: ${activeSpaceData.note}` : "Финансы → Документы → Команда"}</p>
        </main>

        <aside className="as6-master__identity">
          <button type="button" className="as6-master__logo" onClick={() => navigate?.("home")} aria-label="AS6">
            <span>AS6</span><small>AI PLATFORM</small>
          </button>
          <button type="button" className="as6-master__workspace" onClick={() => setWorkspaceOpen((value) => !value)} aria-expanded={workspaceOpen}>AS6 <span>⌄</span></button>
          {workspaceOpen && <div className="as6-master__workspace-menu"><button type="button">AS6</button><small>Переключение рабочих пространств будет доступно позже</small></div>}

          <div className="as6-master__greeting">
            <strong>Доброе утро, {profileName}.</strong>
            <span>Рабочий день подготовлен.</span>
          </div>
          <div className="as6-master__avatar" aria-label={`Профиль: ${profileName}`}><span>В</span></div>

          <section className="as6-master__ready">
            <h2>AS6 уже подготовил</h2>
            <ul>
              <li><i>✓</i>Финансовую модель</li>
              <li><i>✓</i>Презентацию инвестору</li>
              <li><i>✓</i>Ответы на вопросы</li>
              <li><i>✓</i>План встречи</li>
            </ul>
            <p>Все ключевые материалы собраны и согласованы.</p>
          </section>
        </aside>

        <aside className="as6-master__guide">
          <section><h2>Почему именно сейчас</h2><p>Финансовый прогноз — единственный фактор, который ещё может изменить итог встречи.</p></section>
          <section><h2>Что будет дальше</h2><article><div><strong>Через 3 минуты</strong><span>Проверка завершится, и презентация обновится автоматически.</span></div></article></section>
          <section><h2>Что изменится</h2><p>Вероятность успешной встречи вырастет до 95%.</p></section>
        </aside>

        <form className="as6-master__intent" onSubmit={submitIntent}>
          <button type="button" className="as6-master__mic" aria-label={listening ? "Остановить голосовой ввод" : "Голосовой ввод"} aria-pressed={listening} onClick={() => setListening((value) => !value)}><MicrophoneGlyph listening={listening} /></button>
          <label htmlFor="as6-master-intent">Намерение</label>
          <input id="as6-master-intent" value={intent} onChange={(event) => setIntent(event.target.value)} autoComplete="off" />
          <button type="submit" className="as6-master__send" aria-label="Передать намерение" disabled={!intent.trim()}>→</button>
        </form>
      </div>
    </section>
  );
}
