import React, { useEffect, useMemo, useState } from "react";
import "./AS6MasterScreen.css";
import "./AS6MasterScreenPolish.css";

const spaces = [
  { id: "sales", label: "Продажи", note: "Прогноз обновлён.", x: 26, y: 23, symbol: "✦" },
  { id: "relations", label: "CRM", note: "Контакты готовы.", x: 50, y: 12 },
  { id: "marketing", label: "Маркетинг", note: "Стратегия утверждена.", x: 76, y: 24 },
  { id: "finance", label: "Финансы", note: "Модель проверена.", x: 15, y: 58 },
  { id: "documents", label: "Документы", note: "Презентация готова.", x: 11, y: 83 },
  { id: "team", label: "Команда", note: "Все согласования завершены.", x: 79, y: 75 },
];

const paths = [
  "M50 12 C41 13 39 27 26 23 C18 20 18 43 15 58 C13 69 12 77 11 83",
  "M50 12 C59 13 63 24 76 24 C84 25 84 45 81 52 C78 59 77 67 79 75",
  "M26 23 C34 31 38 37 50 39 C62 37 67 31 76 24",
  "M15 58 C27 52 34 65 38 78 C42 92 64 94 79 75",
  "M11 83 C24 91 31 88 38 78",
];

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

      <header className="as6-master__topbar">
        <div className="as6-master__today">
          <h1>Сегодня</h1>
          <p>4 цели сегодня <i /> 2 встречи <i /> 1 решение высокой важности</p>
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
          <h2>Что уже готово</h2>
          <ul>
            <li><i>✓</i>Документы</li>
            <li><i>✓</i>Аналитика</li>
            <li><i>✓</i>Прогнозы</li>
          </ul>
          <p>Все ключевые материалы готовы.</p>
        </section>
      </aside>

      <main className="as6-master__space">
        <svg className="as6-master__graph" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="as6-soft-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="0.55" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {paths.map((path) => <path key={path} d={path} />)}
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
              <span className="as6-master__node-mark" aria-hidden="true">{space.symbol || ""}</span>
              <strong>{space.label}</strong><small>{space.note}</small>
            </button>
          );
        })}

        <article className="as6-master__focus">
          <div className="as6-master__focus-check">✓</div>
          <h2>Презентация инвестору</h2>
          <strong>Готова к финальной проверке</strong>
          <p>До встречи с инвестором — 40 минут</p>
          <div className="as6-master__progress" aria-label="Этапы подготовки презентации">
            {["Подготовка", "Проверка", "Отправка", "Завершено"].map((step, index) => <div key={step} className={index < 2 ? "is-active" : ""}><span>{step}</span><i /></div>)}
          </div>
        </article>
        <p className="as6-master__space-status" aria-live="polite">{activeSpaceData ? `${activeSpaceData.label}: ${activeSpaceData.note}` : ""}</p>
      </main>

      <aside className="as6-master__guide">
        <section><h2>Почему именно сейчас</h2><p>Презентация готова к финальной проверке.</p><p>ИИ рекомендует проверить финансовый прогноз.</p><p>Ориентировочное время — 3 минуты.</p></section>
        <section><h2>Что будет дальше</h2><article><i /><div><strong>Затем</strong><span>Отправить презентацию инвестору.</span></div></article><article><i /><div><strong>Позже</strong><span>Закрыть сделку с Orion.</span></div></article></section>
        <section><h2>Что изменится</h2><p>После проверки презентация станет полностью готова к отправке.</p><p>До встречи остаётся достаточно времени для завершения проверки.</p></section>
      </aside>

      <form className="as6-master__intent" onSubmit={submitIntent}>
        <button type="button" className="as6-master__mic" aria-label={listening ? "Остановить голосовой ввод" : "Голосовой ввод"} aria-pressed={listening} onClick={() => setListening((value) => !value)}>{listening ? "●" : "♩"}</button>
        <label htmlFor="as6-master-intent">Намерение</label>
        <input id="as6-master-intent" value={intent} onChange={(event) => setIntent(event.target.value)} autoComplete="off" />
        <button type="submit" className="as6-master__send" aria-label="Передать намерение" disabled={!intent.trim()}>→</button>
      </form>
    </section>
  );
}
