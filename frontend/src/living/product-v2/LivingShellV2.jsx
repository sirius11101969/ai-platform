import React, { useEffect, useMemo, useRef, useState } from "react";
import "./LivingShellV2.css";
import { loadLivingReadOnlyData } from "./livingReadOnlyData.js";
import { clearAuthSession, getStoredUser } from "../../services/api.js";
import LivingSpaceEngine from "./LivingSpaceEngine.jsx";
import { livingSpaceRegistry, getLivingSpaceDefinition } from "./livingSpaceRegistry.js";

const spaces = livingSpaceRegistry;

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
  const modules = [
    { id: "relations", label: "Клиенты", note: "Отношения и следующий шаг", symbol: "◌" },
    { id: "projects", label: "Проекты", note: "Результаты и движение", symbol: "◇" },
    { id: "documents", label: "Документы", note: "Контекст и материалы", symbol: "▤" },
    { id: "knowledge", label: "Знания", note: "Решения и память", symbol: "◎" }
  ];

  const activity = [
    { title: "Контур авторизации защищён", meta: "Сегодня · Production" },
    { title: "Профиль и безопасный выход подключены", meta: "Сегодня · Living Space" },
    { title: "Документы работают в режиме чтения", meta: "Последнее изменение · Данные" }
  ];

  return (
    <div className="as6-v2-workspace">
      <section className="as6-v2-workspace-hero">
        <div>
          <span className="as6-v2-eyebrow">Ваше рабочее пространство</span>
          <h1>Здравствуйте, Владимир.</h1>
          <p>AS6 собрал главное в одном месте. Начните с намерения или откройте нужный рабочий контекст.</p>
        </div>
        <div className="as6-v2-workspace-status" aria-label="Состояние пространства">
          <span><i />Система спокойна</span>
          <strong>99,9%</strong>
          <small>готовность платформы</small>
        </div>
      </section>

      <section className="as6-v2-conductor-entry">
        <div className="as6-v2-conductor-entry__mark" aria-hidden="true"><BrandMark /></div>
        <div>
          <span className="as6-v2-eyebrow">AI-дирижёр</span>
          <h2>Что должно измениться сегодня?</h2>
          <p>Опишите результат обычными словами. Сначала AS6 покажет безопасный план.</p>
        </div>
        <button type="button" className="as6-v2-primary" onClick={() => navigate("conductor")}>
          <span>Сформулировать намерение</span><b aria-hidden="true">→</b>
        </button>
      </section>

      <section className="as6-v2-workspace-section">
        <header><div><span className="as6-v2-eyebrow">Закреплено</span><h2>Рабочие контуры</h2></div><small>Один клик до нужного контекста</small></header>
        <div className="as6-v2-module-grid">
          {modules.map((module) => (
            <button type="button" key={module.id} onClick={() => navigate(module.id)}>
              <span className="as6-v2-module-symbol">{module.symbol}</span>
              <span><strong>{module.label}</strong><small>{module.note}</small></span>
              <b aria-hidden="true">→</b>
            </button>
          ))}
        </div>
      </section>

      <div className="as6-v2-workspace-columns">
        <section className="as6-v2-workspace-panel">
          <header><div><span className="as6-v2-eyebrow">Недавнее</span><h2>Последние действия</h2></div><button type="button" onClick={() => navigate("projects")}>Все события</button></header>
          <div className="as6-v2-activity-list">
            {activity.map((item, index) => (
              <article key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong><small>{item.meta}</small></div></article>
            ))}
          </div>
        </section>

        <section className="as6-v2-workspace-panel as6-v2-attention-panel">
          <span className="as6-v2-eyebrow">Требует внимания</span>
          <strong className="as6-v2-attention-number">3</strong>
          <h2>отношения без следующего шага</h2>
          <p>Откройте клиентов и выберите одно понятное действие.</p>
          <button type="button" onClick={() => navigate("relations")}>Посмотреть клиентов →</button>
        </section>
      </div>
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

function UnavailableDomainState({ eyebrow, title, description, reason }) {
  return (
    <div className="as6-v2-state">
      <section className="as6-v2-hero">
        <span className="as6-v2-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
      <div className="as6-v2-data-state">
        <strong>Источник данных ещё не подключён.</strong>
        <small>{reason}</small>
      </div>
      <p className="as6-v2-readonly-note">AS6 не показывает вымышленные production-данные</p>
    </div>
  );
}

function ProjectsState({ livingData }) {
  return <UnavailableDomainState eyebrow="Проекты" title="Рабочие проекты появятся здесь." description="AS6 создаёт отдельную каноническую модель проектов с изоляцией по рабочему пространству." reason={livingData.data?.domainStatus?.projects?.reason || "Модель проектов ещё не создана"} />;
}

function formatDocumentSize(sizeBytes) {
  const bytes = Number(sizeBytes || 0);
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function formatDocumentDate(value) {
  if (!value) return "Дата не указана";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Дата не указана";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function getDocumentType(mimeType) {
  const value = String(mimeType || "").toLowerCase();
  if (value.includes("pdf")) return "PDF";
  if (value.startsWith("image/")) return "Изображение";
  if (value.includes("word")) return "Документ";
  if (value.includes("sheet") || value.includes("excel")) return "Таблица";
  if (value.includes("presentation") || value.includes("powerpoint")) return "Презентация";
  return "Файл";
}

function DocumentsState({ livingData }) {
  if (livingData.status === "loading") {
    return <div className="as6-v2-state"><section className="as6-v2-hero"><span className="as6-v2-eyebrow">Материалы и вложения</span><h1>Собираем рабочие материалы.</h1><p>AS6 безопасно читает файлы активного рабочего пространства.</p></section><div className="as6-v2-data-state" role="status"><span className="as6-v2-data-pulse" /><strong>Загружаем материалы…</strong><small>Изменение и удаление файлов отключены.</small></div></div>;
  }
  const documentStatus = livingData.data?.domainStatus?.documents;
  if (!documentStatus?.available) {
    return <div className="as6-v2-state"><section className="as6-v2-hero"><span className="as6-v2-eyebrow">Материалы и вложения</span><h1>Не удалось открыть материалы.</h1><p>Данные не изменены. Проверьте авторизацию и активное пространство.</p></section><div className="as6-v2-data-state as6-v2-data-state--error" role="alert"><strong>{documentStatus?.error || "Ошибка чтения материалов"}</strong><small>После восстановления подключения обновите страницу.</small></div></div>;
  }
  const documents = livingData.data?.documents || [];
  return (
    <div className="as6-v2-state">
      <section className="as6-v2-hero"><span className="as6-v2-eyebrow">Living Documents · реальные данные</span><h1>Материалы в рабочем контексте.</h1><p>Здесь отображаются реальные вложения активного workspace. Загрузка, изменение и удаление файлов отключены.</p></section>
      {!documents.length ? <div className="as6-v2-data-state"><strong>В пространстве пока нет материалов.</strong><small>Здесь появятся вложения после добавления первого файла к работе с клиентом.</small></div> : <div className="as6-v2-library">{documents.map((document, index) => <article className="as6-v2-document-row" key={document.id || `${document.fileName}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{document.fileName}</strong><small>{getDocumentType(document.mimeType)} · {formatDocumentSize(document.sizeBytes)}</small></div><small>{formatDocumentDate(document.createdAt)}</small><button type="button" disabled aria-label={`Открыть материал ${document.fileName}`} title="Безопасное открытие файла будет подключено отдельным этапом">→</button></article>)}</div>}
      <p className="as6-v2-readonly-note">Только чтение · {documents.length} материалов · активное workspace</p>
    </div>
  );
}

function KnowledgeState({ livingData }) {
  return <UnavailableDomainState eyebrow="Знания" title="Память решений появится здесь." description="Внутренние AI-структуры будут преобразованы в безопасные и понятные знания." reason={livingData.data?.domainStatus?.knowledge?.reason || "Адаптер знаний ещё не подключён"} />;
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
  if (id === "projects") return <ProjectsState livingData={livingData} />;
  if (id === "documents") return <DocumentsState livingData={livingData} />;
  if (id === "knowledge") return <KnowledgeState livingData={livingData} />;
  const engineDefinition = getLivingSpaceDefinition(id);
  if (engineDefinition?.engine) return <LivingSpaceEngine definition={engineDefinition} navigate={navigate} />;
  if (id === "blog") return <BlogState />;
  if (id === "settings") return <SettingsState />;
  return <HomeState navigate={navigate} />;
}

export default function LivingShellV2() {
  const [activeId, setActiveId] = useState(() => resolveSpace(window.location.pathname));
  const [commandOpen, setCommandOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const profileRef = useRef(null);
  const storedUser = useMemo(() => getStoredUser() || {}, []);
  const profileName = storedUser.name || storedUser.fullName || "Владимир";
  const profileEmail = storedUser.email || "Аккаунт AS6";
  const profileInitial = String(profileName).trim().charAt(0).toUpperCase() || "В";
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

  function handleLogout() {
    setProfileOpen(false);
    clearAuthSession();
    try {
      window.localStorage.removeItem("ai-platform-workspace-id");
      window.sessionStorage.removeItem("ai-platform-workspace-id");
    } catch (_error) {
      // Storage can be unavailable in restricted browser contexts.
    }
    window.location.replace("/login");
  }

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
      if (event.key === "Escape") {
        setCommandOpen(false);
        setProfileOpen(false);
      }
    }

    function onPointerDown(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
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
          {spaces.filter((space) => space.kind !== "utility").map((space) => (
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

          <div className="as6-v2-profile-wrap" ref={profileRef}>
            <button
              type="button"
              className="as6-v2-profile"
              aria-label={`Профиль ${profileName}`}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((value) => !value)}
            >
              <span>{profileInitial}</span>
              <i />
            </button>

            {profileOpen && (
              <section className="as6-v2-profile-menu" role="menu" aria-label="Меню профиля">
                <header>
                  <span className="as6-v2-profile-avatar" aria-hidden="true">{profileInitial}</span>
                  <span><strong>{profileName}</strong><small>{profileEmail}</small></span>
                </header>
                <div className="as6-v2-profile-separator" />
                <button type="button" role="menuitem" onClick={() => navigate("settings")}>
                  <span>Настройки пространства</span><b aria-hidden="true">→</b>
                </button>
                <a href="/" role="menuitem">
                  <span>Перейти на сайт</span><b aria-hidden="true">→</b>
                </a>
                <div className="as6-v2-profile-separator" />
                <button type="button" role="menuitem" className="as6-v2-profile-logout" onClick={handleLogout}>
                  <span>Выйти из AS6</span><b aria-hidden="true">↗</b>
                </button>
              </section>
            )}
          </div>
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
