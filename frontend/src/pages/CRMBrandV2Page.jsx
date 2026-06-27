import React from "react";
import "../styles/as6-crm-brand-v2.css";

const metrics = [
  ["Выручка сегодня", "$1,248,890", "+18.6%", "money"],
  ["Новые лиды", "247", "+32%", "leads"],
  ["Сделки в работе", "87", "+14%", "deals"],
  ["AI сотрудники", "28 / 28", "Активны", "ai"],
];

const actions = ["Создать лид", "Создать сделку", "Добавить задачу", "Approval Queue", "AI аналитика", "Отчёты", "Настроить AI"];

const brain = [
  ["Forecast 7 дней", "1 201 390 ₽", "+18%"],
  ["Hot Leads", "18", "+12%"],
  ["Risk Deals", "8", "+7%"],
  ["AI Score", "76", "+6%"],
  ["Pipeline Health", "92%", "+10%"],
  ["At-risk", "3", "+2%"],
];

const stages = [
  ["Новый", "12", "90 000 ₽", ["Игорь Павлов", "Мария Кузнецова"]],
  ["Квалификация", "1", "0 ₽", ["Stage Recommendation Test"]],
  ["Предложение", "2", "830 000 ₽", ["Алексей Морозов", "Елена Смирнова"]],
  ["Встреча", "1", "990 ₽", ["Telegram Connect Test"]],
  ["Успешно", "4", "2 980 ₽", ["Мария Кузнецова", "Дмитрий Волков"]],
];

export default function CRMBrandV2Page() {
  return (
    <div className="as6-crm-v2" data-as6-crm-brand-v2="active">
      <aside className="as6-crm-v2-sidebar">
        <div className="as6-crm-v2-logo">AS6<span>AI PLATFORM</span></div>
        <nav className="as6-crm-v2-nav" aria-label="AS6 navigation">
          {["Command Center", "Dashboard", "CRM-воронка", "AI сотрудники", "AI Revenue Intelligence", "Revenue Dashboard", "AI Pipeline Copilot", "AI Follow-ups", "AI Priority Inbox"].map((item) => (
            <button key={item} className={item === "CRM-воронка" ? "active" : ""}>{item}</button>
          ))}
        </nav>
        <section className="as6-crm-v2-owner"><strong>AS6 Owner</strong><span>Владимир · online</span></section>
        <section className="as6-crm-v2-credits"><span>AI-кредиты</span><strong>865</strong><p>Живой баланс из профиля пользователя</p></section>
      </aside>

      <main className="as6-crm-v2-main">
        <header className="as6-crm-v2-header">
          <div>
            <span className="as6-crm-v2-eyebrow">Защищённое рабочее пространство</span>
            <h1>AI-ОС выручки <em>PRO</em></h1>
            <p>Текущее пространство: <strong>buylesson workspace</strong></p>
          </div>
          <div className="as6-crm-v2-toolbar">
            <button>Команда и тариф</button>
            <button>Поиск</button>
            <button>Уведомления</button>
            <button>AS6</button>
          </div>
        </header>

        <section className="as6-crm-v2-metrics" aria-label="Ключевые показатели">
          {metrics.map(([label, value, delta, tone]) => <article key={label} data-tone={tone}><span>{label}</span><strong>{value}</strong><em>{delta}</em></article>)}
        </section>

        <section className="as6-crm-v2-action-center">
          <h2>AI Action Center</h2>
          <div>{actions.map((action) => <button key={action}>{action}</button>)}</div>
        </section>

        <section className="as6-crm-v2-brain">
          <div className="as6-crm-v2-brain-title"><span>AI</span><h2>Revenue Brain</h2></div>
          <div className="as6-crm-v2-brain-grid">{brain.map(([label, value, delta]) => <article key={label}><span>{label}</span><strong>{value}</strong><em>{delta}</em></article>)}</div>
          <div className="as6-crm-v2-recommendation"><strong>AI рекомендация</strong><p>У вас 8 горячих лидов, требующих ответа. Рекомендуем отправить персональное предложение в течение 24 часов.</p><button>Открыть Revenue Brain</button></div>
        </section>

        <section className="as6-crm-v2-pipeline">
          <h2>CRM Pipeline</h2>
          <div className="as6-crm-v2-stages">
            {stages.map(([stage, count, sum, leads]) => (
              <article className="as6-crm-v2-stage" key={stage}>
                <header><div><strong>{stage}</strong><span>{count} · {sum}</span></div><b>{count}</b></header>
                {leads.map((lead, index) => <div className="as6-crm-v2-lead" key={lead}><strong>{lead}</strong><span>AI {index ? "81" : "100"}/100</span><small>Close {index ? "71" : "23"}%</small></div>)}
                <button>+ Добавить лид</button>
              </article>
            ))}
          </div>
        </section>
      </main>

      <aside className="as6-crm-v2-right">
        <section className="as6-crm-v2-copilot"><span>AI Copilot</span><strong>Спросить AS6</strong><p>Аналитика, рекомендации, ответы.</p><button>Спросить</button></section>
        <section className="as6-crm-v2-card"><span>Рекомендация AS6</span><strong>P1</strong><p>Сфокусируйтесь на 8 горячих лидах — вероятность сделки выше на 38%.</p><button>Проверить лиды</button></section>
        <section className="as6-crm-v2-card"><span>Последние события</span><p>AI SDR Agent отправил письмо лиду.</p><p>Сделка перемещена в переговоры.</p><p>AI follow-up запланирован.</p></section>
      </aside>
    </div>
  );
}
