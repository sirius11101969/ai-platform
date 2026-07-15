import React, { useEffect, useMemo, useRef, useState } from "react";
import "./LivingShellV2.css";
import { loadLivingReadOnlyData } from "./livingReadOnlyData.js";

const spaces = [
  { id: "home", path: "/app", label: "Дом", short: "Главный фокус", symbol: "⌂" },
  { id: "conductor", path: "/app/conductor", label: "AI-дирижёр", short: "Намерение и план", symbol: "✦" },
  { id: "relations", path: "/app/relations", label: "Клиенты", short: "Отношения и внимание", symbol: "◌" },
  { id: "projects", path: "/app/projects", label: "Проекты", short: "Результаты и движение", symbol: "◇" },
  { id: "documents", path: "/app/documents", label: "Документы", short: "Контекст и материалы", symbol: "▤" },
  { id: "knowledge", path: "/app/knowledge", label: "Знания", short: "Решения и память", symbol: "◎" },
  { id: "blog", path: "/app/blog", label: "Блог", short: "Идеи в действии", symbol: "◫" },
  { id: "settings", path: "/app/settings", label: "Настройки", short: "Ваше пространство", symbol: "⚙" }
];

const commandItems = [
  { title: "Открыть AI-дирижёра", hint: "Сформулировать намерение", target: "conductor" },
  { title: "Найти клиента", hint: "Поиск по отношениям", target: "relations" },
  { title: "Открыть проекты", hint: "Посмотреть текущее движение", target: "projects" },
  { title: "Найти документ", hint: "Поиск по рабочим материалам", target: "documents" },
  { title: "Открыть знания", hint: "История решений и контекст", target: "knowledge" },
  { title: "Прочитать Living Blog", hint: "Идеи, которые можно применить", target: "blog" }
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
      <span className="as6-v2-eyebrow">Главный фокус</span>
      <h2>Создать спокойную систему роста AS6.</h2>
      <p>
        Пространство собрало текущий контекст. Следующий разумный шаг —
        проверить клиентский путь и выбрать одну задачу для AI-дирижёра.
      </p>
      <button type="button" className="as6-v2-primary" onClick={onOpen}>
        <span>Продолжить с AI</span>
        <b aria-hidden="true">→</b>
      </button>
    </article>
  );
}

function HomeState({ navigate }) {
  return (
    <div className="as6-v2-state-grid">
      <section className="as6-v2-hero">
        <span className="as6-v2-eyebrow">Вторник · пространство спокойно</span>
        <h1>Здравствуйте, Владимир.</h1>
        <p>
          Всё важное собрано здесь. Не нужно искать раздел —
          начните с намерения или продолжите главное действие.
        </p>
      </section>

      <FocusCard onOpen={() => navigate("conductor")} />

      <article className="as6-v2-panel as6-v2-panel-wide">
        <header>
          <span className="as6-v2-eyebrow">Что изменилось</span>
          <button type="button" onClick={() => navigate("projects")}>Все события</button>
        </header>
        <div className="as6-v2-timeline">
          <div><i /><span><strong>Production готов</strong><small>Мониторинг и backup работают автоматически</small></span></div>
          <div><i /><span><strong>Living Space v2 зафиксирован</strong><small>Blueprint и Design System стали каноном</small></span></div>
          <div><i /><span><strong>Безопасность усилена</strong><small>Уязвимости backend устранены</small></span></div>
        </div>
      </article>

      <article className="as6-v2-panel">
        <span className="as6-v2-eyebrow">Требует внимания</span>
        <strong className="as6-v2-large-number">3</strong>
        <p>отношения, где следующий шаг ещё не определён</p>
        <button type="button" onClick={() => navigate("relations")}>Посмотреть клиентов →</button>
      </article>

      <article className="as6-v2-panel">
        <span className="as6-v2-eyebrow">Знание дня</span>
        <h3>Простота — это отсутствие лишнего решения.</h3>
        <p>AS6 должен подсказывать одно понятное действие вместо списка функций.</p>
        <button type="button" onClick={() => navigate("knowledge")}>Открыть контекст →</button>
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
        "Собрать доступный контекст",
        "Показать безопасный план",
        "Запросить подтверждение изменений"
      ]
    });
  }

  return (
    <div className="as6-v2-conductor">
      <section className="as6-v2-hero as6-v2-hero-centered">
        <span className="as6-v2-eyebrow">AI-дирижёр</span>
        <h1>Что должно измениться?</h1>
        <p>Опишите результат обычными словами. AS6 сначала покажет план и ничего не изменит без подтверждения.</p>
      </section>

      <form className="as6-v2-intent" onSubmit={submit}>
        <textarea
          value={intent}
          onChange={(event) => setIntent(event.target.value)}
          placeholder="Например: найди клиентов, которым мы давно не отвечали, и предложи следующий шаг"
          aria-label="Намерение для AI-дирижёра"
        />
        <button type="submit" className="as6-v2-primary">
          <span>Собрать план</span>
          <b aria-hidden="true">→</b>
        </button>
      </form>

      {plan ? (
        <article className="as6-v2-plan">
          <span className="as6-v2-eyebrow">AS6 понял намерение</span>
          <h2>{plan.intent}</h2>
          <ol>
            {plan.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <div className="as6-v2-plan-actions">
            <button type="button" className="as6-v2-primary">Подтвердить план</button>
            <button type="button" className="as6-v2-secondary" onClick={() => setPlan(null)}>Уточнить</button>
          </div>
          <small>Прототип: реальные изменения данных отключены.</small>
        </article>
      ) : (
        <div className="as6-v2-suggestions">
          {[
            "Что сейчас важнее всего?",
            "Покажи риски по клиентам",
            "Собери план развития продукта"
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

function RelationsState({ livingData }) {
  const statusLabels = {
    new: "Новый контакт",
    qualified: "Квалифицирован",
    proposal: "Предложение",
    booked: "Встреча назначена",
    won: "Успешно завершён",
    lost: "Закрыт",
  };

  if (livingData.status === "loading") {
    return (
      <div className="as6-v2-state">
        <section className="as6-v2-hero">
          <span className="as6-v2-eyebrow">Living CRM</span>
          <h1>Собираем отношения вашего пространства.</h1>
          <p>AS6 безопасно читает данные активного рабочего пространства.</p>
        </section>
        <div className="as6-v2-data-state" role="status">
          <span className="as6-v2-data-pulse" />
          <strong>Загружаем клиентов…</strong>
          <small>Изменения данных отключены.</small>
        </div>
      </div>
    );
  }

  if (livingData.status === "error") {
    return (
      <div className="as6-v2-state">
        <section className="as6-v2-hero">
          <span className="as6-v2-eyebrow">Living CRM</span>
          <h1>Не удалось открыть отношения.</h1>
          <p>Данные не изменены. Проверьте авторизацию и активное пространство.</p>
        </section>
        <div className="as6-v2-data-state as6-v2-data-state--error" role="alert">
          <strong>{livingData.error || "Ошибка чтения CRM"}</strong>
          <small>Обновите страницу после проверки подключения.</small>
        </div>
      </div>
    );
  }

  const relations = livingData.data?.relations || [];

  return (
    <div className="as6-v2-state">
      <section className="as6-v2-hero">
        <span className="as6-v2-eyebrow">Living CRM · реальные данные</span>
        <h1>Отношения, которым нужно внимание.</h1>
        <p>
          Данные загружены только для чтения из активного пространства.
          AI-дирижёр пока не может изменять клиентов.
        </p>
      </section>

      {!relations.length ? (
        <div className="as6-v2-data-state">
          <strong>В пространстве пока нет клиентов.</strong>
          <small>
            Здесь появятся реальные отношения после добавления первого клиента.
          </small>
        </div>
      ) : (
        <div className="as6-v2-list">
          {relations.map((lead) => (
            <article key={lead.id || lead.name}>
              <span className="as6-v2-node"><i /></span>

              <div>
                <h3>{lead.name}</h3>
                <p>
                  {lead.company || lead.email || lead.phone || "Контактные данные не указаны"}
                </p>
              </div>

              <strong>
                {statusLabels[lead.status] || lead.status || "Статус не определён"}
              </strong>

              <button
                type="button"
                aria-label={`Открыть клиента ${lead.name}`}
                disabled
                title="Детальная карточка будет подключена следующим этапом"
              >
                →
              </button>
            </article>
          ))}
        </div>
      )}

      <p className="as6-v2-readonly-note">
        Только чтение · {relations.length} клиентов · активное workspace
      </p>
    </div>
  );
}

function ProjectsState() {
  return (
    <div className="as6-v2-state">
      <section className="as6-v2-hero">
        <span className="as6-v2-eyebrow">Проекты</span>
        <h1>Движение к результату.</h1>
        <p>Каждый проект показывает этап, препятствие и ближайшее действие.</p>
      </section>
      <div className="as6-v2-card-grid">
        {[
          ["Living Space v2", "Прототип оболочки", "78%", "Утвердить главный экран"],
          ["Публичный сайт", "Новый бренд опубликован", "92%", "Расширить Living Blog"],
          ["AI-дирижёр", "Контракт взаимодействия", "46%", "Подключить безопасные действия"]
        ].map(([title, stage, progress, next]) => (
          <article className="as6-v2-project" key={title}>
            <span className="as6-v2-eyebrow">{stage}</span>
            <h2>{title}</h2>
            <div className="as6-v2-progress"><i style={{ width: progress }} /></div>
            <small>{progress} готово</small>
            <p>Следующее: {next}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function LibraryState({ type }) {
  const content = type === "documents"
    ? {
        eyebrow: "Документы",
        title: "Материалы в рабочем контексте.",
        description: "Документ связан с проектом, клиентом, решением и историей.",
        items: ["Living Space v2 Blueprint", "Production Readiness", "AS6 Design System"]
      }
    : {
        eyebrow: "Знания",
        title: "Память решений AS6.",
        description: "Здесь собраны объяснения, стандарты и опыт, который помогает действовать.",
        items: ["Почему AS6 — одно пространство", "Diagnostics First", "Принципы спокойного интерфейса"]
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
            <small>Открыть в пространстве</small>
            <b>→</b>
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
        <h1>Идеи, которые превращаются в действия.</h1>
        <p>После чтения материал можно сохранить, обсудить с AI или добавить в проект.</p>
      </section>
      <div className="as6-v2-card-grid">
        {[
          ["Продукт без лишней навигации", "7 минут"],
          ["Как AI становится дирижёром", "9 минут"],
          ["Спокойный бизнес как система", "6 минут"]
        ].map(([title, time]) => (
          <article className="as6-v2-article" key={title}>
            <span className="as6-v2-eyebrow">{time}</span>
            <h2>{title}</h2>
            <p>Короткий практический материал, связанный с развитием AS6.</p>
            <button type="button">Прочитать и применить →</button>
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
        <span className="as6-v2-eyebrow">Настройки пространства</span>
        <h1>AS6 работает в вашем ритме.</h1>
        <p>Только понятные настройки, которые действительно влияют на работу.</p>
      </section>
      <div className="as6-v2-settings">
        {[
          ["Спокойный режим", "Показывать только главное", true],
          ["Подтверждение AI", "Всегда спрашивать перед изменением данных", true],
          ["Утренний фокус", "Собирать одно главное действие на день", false]
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

function ActiveState({ id, navigate, livingData }) {
  if (id === "conductor") return <ConductorState />;
  if (id === "relations") return <RelationsState livingData={livingData} />;
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
  const [livingData, setLivingData] = useState({
    status: "loading",
    data: null,
    error: "",
  });
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
    let cancelled = false;

    loadLivingReadOnlyData()
      .then((data) => {
        if (!cancelled) {
          setLivingData({ status: "ready", data, error: "" });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLivingData({
            status: "error",
            data: null,
            error: error?.message || "Не удалось загрузить данные пространства",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
        <a href="/" className="as6-v2-brand" aria-label="AS6 — главная">
          <BrandMark />
          <span><strong>AS6</strong><small>Живое пространство</small></span>
        </a>

        <nav aria-label="Состояния Living Space">
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
          <span><strong>Система спокойна</strong><small>Все контуры работают</small></span>
        </div>
      </aside>

      <main className="as6-v2-main">
        <header className="as6-v2-topbar">
          <div>
            <span className="as6-v2-eyebrow">Текущее пространство</span>
            <strong>{activeSpace.label}</strong>
          </div>

          <button type="button" className="as6-v2-search-trigger" onClick={() => setCommandOpen(true)}>
            <span>Найти или сделать что-то…</span>
            <kbd>Ctrl K</kbd>
          </button>

          <button type="button" className="as6-v2-profile" aria-label="Профиль Владимира">
            <span>В</span>
            <i />
          </button>
        </header>

        <div className="as6-v2-canvas">
          <ActiveState id={activeId} navigate={navigate} livingData={livingData} />
        </div>
      </main>

      {commandOpen && (
        <div className="as6-v2-command-layer" role="presentation" onMouseDown={() => setCommandOpen(false)}>
          <section
            className="as6-v2-command"
            role="dialog"
            aria-modal="true"
            aria-label="Универсальная команда AS6"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <BrandMark />
              <input
                ref={commandInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Найти, открыть, создать или проанализировать…"
                aria-label="Поиск команд"
              />
              <kbd>Esc</kbd>
            </header>

            <div className="as6-v2-command-results">
              <span className="as6-v2-eyebrow">Предложения</span>
              {filteredCommands.map((item) => (
                <button type="button" key={item.title} onClick={() => navigate(item.target)}>
                  <span><strong>{item.title}</strong><small>{item.hint}</small></span>
                  <b>→</b>
                </button>
              ))}
              {!filteredCommands.length && (
                <p>Ничего не найдено. Сформулируйте намерение иначе.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
