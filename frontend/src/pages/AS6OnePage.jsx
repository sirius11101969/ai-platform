import React, { useMemo, useState } from "react";
import "../styles/as6-one.css";

const copy = {
  ru: {
    lifeform: "Первая цифровая форма жизни для бизнеса",
    commandPlaceholder: "Что нужно сделать?",
    workspace: "AS6 Enterprise Workspace",
    team: "Команда Pro",
    core: "AS6 Core",
    nav: ["Главная", "AS6 Генеральный директор", "Продажи", "Клиенты", "Финансы", "Маркетинг", "Сотрудники", "Производство", "Документы", "Аналитика", "Автоматизация", "Интеграции", "Настройки"],
    bottom: ["Владелец AS6", "AI-кредиты", "AS6 Core", "Поддержка"],
    director: "AS6 Генеральный директор",
    subtitle: "Ваш цифровой руководитель",
    plan: ["Закрыть 4 сделки", "Ответить 12 клиентам", "Перезапустить 3 сделки", "Назначить встречу"],
    forecast: "Прогноз роста",
    runPlan: "Выполнить план AS6",
    kpis: [
      ["Выручка сегодня", "1 248 000 ₽", "+18.4%"], ["Новые лиды", "76", "+12"], ["Сделки в работе", "143", "+9.8%"],
      ["AS6 сотрудники", "28", "online"], ["Конверсия", "32.8%", "+4.1%"], ["Revenue at Risk", "420 000 ₽", "-11%"]
    ],
    actions: ["Создать лид", "Создать сделку", "Добавить задачу", "Запустить follow-up", "Запустить scoring", "Открыть Revenue Brain", "Настроить AS6"],
    revenue: {
      title: "Revenue Brain", days: "Прогноз 7 дней", plan: "Вероятность выполнения плана", hot: "Горячие лиды", risk: "Риск-сделки",
      score: "AS6-оценка", health: "Здоровье воронки", next: "Следующее лучшее действие", effect: "Ожидаемый эффект", open: "Открыть Revenue Brain"
    },
    columns: ["Новый", "Квалификация", "Предложение", "Встреча", "Успешно"],
    assistant: "AS6 Помощник", ask: "Спросить AS6", assistantDesc: "Аналитика, рекомендации, следующие действия", recommendation: "Рекомендация AS6",
    timeline: "AS6 Timeline", system: "Состояние системы", status: ["AS6 работает", "CRM синхронизирована", "Почта подключена", "Telegram подключён", "WhatsApp подключён", "Все сервисы онлайн"], updated: "Обновлено"
  },
  en: {
    lifeform: "The first digital lifeform for business",
    commandPlaceholder: "What should be done?",
    workspace: "AS6 Enterprise Workspace",
    team: "Team Pro",
    core: "AS6 Core",
    nav: ["Home", "AS6 General Director", "Sales", "Customers", "Finance", "Marketing", "Employees", "Production", "Documents", "Analytics", "Automation", "Integrations", "Settings"],
    bottom: ["AS6 Owner", "AI credits", "AS6 Core", "Support"],
    director: "AS6 General Director", subtitle: "Your digital executive",
    plan: ["Close 4 deals", "Reply to 12 customers", "Restart 3 deals", "Schedule a meeting"], forecast: "Growth forecast", runPlan: "Execute AS6 plan",
    kpis: [["Revenue today", "₽1,248,000", "+18.4%"], ["New leads", "76", "+12"], ["Active deals", "143", "+9.8%"], ["AS6 employees", "28", "online"], ["Conversion", "32.8%", "+4.1%"], ["Revenue at Risk", "₽420,000", "-11%"]],
    actions: ["Create lead", "Create deal", "Add task", "Launch follow-up", "Run scoring", "Open Revenue Brain", "Configure AS6"],
    revenue: { title: "Revenue Brain", days: "7-day forecast", plan: "Plan attainment probability", hot: "Hot leads", risk: "Risk deals", score: "AS6 score", health: "Pipeline health", next: "Next best action", effect: "Expected effect", open: "Open Revenue Brain" },
    columns: ["New", "Qualification", "Proposal", "Meeting", "Won"], assistant: "AS6 Assistant", ask: "Ask AS6", assistantDesc: "Analytics, recommendations, next actions", recommendation: "AS6 Recommendation", timeline: "AS6 Timeline", system: "System status", status: ["AS6 is running", "CRM synchronized", "Mail connected", "Telegram connected", "WhatsApp connected", "All services online"], updated: "Updated"
  }
};

const deals = [
  ["Orion Capital", "980 000 ₽", 94, "P1", "86%", "сегодня"], ["Nova Retail", "340 000 ₽", 82, "P2", "71%", "27 Jun"],
  ["Atlas Group", "610 000 ₽", 78, "P1", "64%", "28 Jun"], ["Vector AI", "1 200 000 ₽", 91, "P1", "79%", "29 Jun"],
  ["Northstar", "450 000 ₽", 88, "P2", "92%", "30 Jun"]
];

function AS6Sidebar({ t }) { return <aside className="as6-one-sidebar"><div className="as6-one-logo"><span>AS6</span><div><strong>AS6 ONE</strong><small>{t.lifeform}</small></div></div><nav>{t.nav.map((n, i) => <button className={i === 0 ? "active" : ""} key={n}>✦ {n}</button>)}</nav><div className="as6-one-side-bottom">{t.bottom.map((item) => <button key={item}>{item}</button>)}</div></aside>; }
function AS6CommandBar({ t }) { return <div className="as6-command-bar"><span>⌘</span><input placeholder={t.commandPlaceholder} aria-label={t.commandPlaceholder} readOnly /><kbd>Ctrl + K</kbd></div>; }
function AS6TopBar({ t, lang, setLang }) { return <header className="as6-one-topbar"><div><strong>AS6 ONE</strong><small>{t.lifeform}</small></div><AS6CommandBar t={t} /><div className="as6-top-actions"><button onClick={() => setLang(lang === "ru" ? "en" : "ru")}>{lang.toUpperCase()} / {lang === "ru" ? "EN" : "RU"}</button><button>{t.workspace}</button><button>{t.team}</button><button>🔔</button><button>{t.core}</button><span className="as6-avatar">A</span></div></header>; }
function AS6GeneralDirector({ t }) { return <section className="as6-director as6-glass"><div><p className="eyebrow">as6-general-director</p><h1>{t.director}</h1><h2>{t.subtitle}</h2><ul>{t.plan.map((p) => <li key={p}>✓ {p}</li>)}</ul></div><div className="as6-director-plan"><span>{t.forecast}</span><strong>+487 000 ₽</strong><button>{t.runPlan}</button></div></section>; }
function AS6KpiGrid({ t }) { return <section className="as6-kpi-grid">{t.kpis.map(([label, value, trend], i) => <article className="as6-kpi as6-glass" key={label}><span className="icon">◈</span><small>{label}</small><strong>{value}</strong><em>{trend}</em><div className={`spark spark-${i}`} /></article>)}</section>; }
function AS6ActionCenter({ t }) { return <section className="as6-action-center as6-glass">{t.actions.map((a) => <button key={a}>{a}</button>)}</section>; }
function AS6RevenueBrain({ t }) { const r = t.revenue; return <section className="as6-revenue as6-glass"><p className="eyebrow">as6-autonomous-enterprise-lifeform</p><h3>{r.title}</h3><div className="revenue-grid">{[[r.days,"+2.8M ₽"],[r.plan,"87%"],[r.hot,"24"],[r.risk,"6"],[r.score,"94/100"],[r.health,"Stable"],[r.next,"Персональный follow-up"],[r.effect,"+487 000 ₽"]].map(([a,b])=><div key={a}><small>{a}</small><strong>{b}</strong></div>)}</div><button>{r.open}</button></section>; }
function AS6PipelineCard({ deal }) { return <article className="pipeline-card"><strong>{deal[0]}</strong><span>{deal[1]}</span><small>AS6 score {deal[2]} · {deal[3]} · {deal[4]}</small><footer><time>{deal[5]}</time><span>✉︎ ☎︎ ⚡</span></footer></article>; }
function AS6PipelineColumn({ title, items }) { return <div className="pipeline-column"><h4>{title}</h4>{items.map((deal) => <AS6PipelineCard deal={deal} key={deal[0]} />)}</div>; }
function AS6Pipeline({ t }) { return <section className="as6-pipeline"><h3>CRM</h3><div className="pipeline-scroll">{t.columns.map((c, i) => <AS6PipelineColumn title={c} items={[deals[i]]} key={c} />)}</div></section>; }
function AS6AssistantCard({ t }) { return <article className="as6-assistant-card as6-glass"><p className="eyebrow">{t.assistant}</p><h3>{t.ask}</h3><p>{t.assistantDesc}</p><button>{t.ask}</button></article>; }
function AS6Timeline({ t }) { return <article className="as6-glass as6-timeline"><h3>{t.timeline}</h3>{["Lead scored", "Deal risk reduced", "Follow-up queued"].map(x=><p key={x}>● {x}</p>)}</article>; }
function AS6SystemStatus({ t }) { return <article className="as6-glass"><h3>{t.system}</h3>{t.status.slice(0,4).map(s=><p className="status-line" key={s}>● {s}</p>)}</article>; }
function AS6RightRail({ t }) { return <aside className="as6-right-rail"><AS6AssistantCard t={t}/><article className="as6-glass"><h3>{t.recommendation}</h3><p>Сфокусируйтесь на Vector AI и Orion Capital: максимальный прогноз закрытия.</p></article><AS6Timeline t={t}/><AS6SystemStatus t={t}/></aside>; }
function StatusBar({ t }) { const now = useMemo(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), []); return <footer className="as6-statusbar">{t.status.map(s=><span key={s}>● {s}</span>)}<strong>{t.updated}: {now}</strong></footer>; }
export default function AS6OnePage() { const [lang,setLang]=useState("ru"); const t=copy[lang]; return <main className="as6-one-page" data-page="AS6OnePage as6-one as6-autonomous-enterprise-lifeform as6-general-director as6-core"><AS6Sidebar t={t}/><section className="as6-one-shell"><AS6TopBar t={t} lang={lang} setLang={setLang}/><div className="as6-one-content"><div className="as6-main-column"><AS6GeneralDirector t={t}/><AS6KpiGrid t={t}/><AS6ActionCenter t={t}/><AS6RevenueBrain t={t}/><AS6Pipeline t={t}/></div><AS6RightRail t={t}/></div><StatusBar t={t}/></section></main>; }
