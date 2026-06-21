import React from "react";
import "../styles/as6-command-center-reference-page.css";

const kpis = [
  { title: "Выручка сегодня", value: "$1,248,890", delta: "+18.6%", icon: "↗", tone: "green" },
  { title: "Новые лиды", value: "247", delta: "+32%", icon: "👥", tone: "blue" },
  { title: "Сделки в работе", value: "87", delta: "+14%", icon: "💼", tone: "orange" },
  { title: "AI сотрудники", value: "28 / 28", delta: "Активны", icon: "🤖", tone: "cyan" },
  { title: "Конверсия", value: "24.6%", delta: "+8.3%", icon: "◎", tone: "purple" }
];

const menu = ["Command Center", "Dashboard", "CRM", "Revenue", "AI сотрудники", "AI задачи", "AI аналитика", "AI коммуникации", "AI DevOps Center", "AI настройки"];
const favorites = ["Pipeline Copilot", "Approval Queue", "AI SDR Agents"];
const agents = [
  ["AI SDR Agent", "156", "+24%", "a"],
  ["AI Closer Agent", "$842k", "+31%", "b"],
  ["AI Manager Agent", "289", "+18%", "c"]
];

export default function CommandCenterPage() {
  return (
    <main className="as6-command-center-reference-page">
      <aside className="as6-ref-sidebar">
        <div className="as6-ref-logo-box">
          <img src="/assets/as6-logo-CVJWh6mG.webp" alt="AS6 AI Platform" />
        </div>
        <nav className="as6-ref-nav">
          {menu.map((item, index) => (
            <a key={item} className={index === 0 ? "active" : ""} href={index === 0 ? "/command-center" : "#"}>
              <span>{index === 0 ? "🚀" : index === 1 ? "▦" : index === 2 ? "▧" : index === 3 ? "↗" : index === 4 ? "👥" : index === 5 ? "☑" : index === 6 ? "⌁" : index === 7 ? "✉" : index === 8 ? "⌑" : "⚙"}</span>
              {item}
              {item === "AI задачи" && <b>12</b>}
              {item === "AI коммуникации" && <b>3</b>}
            </a>
          ))}
        </nav>
        <section className="as6-ref-favorites">
          <h4>ИЗБРАННОЕ</h4>
          {favorites.map((item, index) => (
            <a key={item} href="#">
              <span>{index === 0 ? "▣" : index === 1 ? "▢" : "⌘"}</span>{item}{index === 1 && <b>7</b>}
            </a>
          ))}
        </section>
        <section className="as6-ref-owner">
          <div className="as6-ref-avatar">B</div>
          <div><strong>AS6 Owner</strong><small>Владимир</small><em>● Онлайн</em></div>
        </section>
        <section className="as6-ref-help">
          <span>✦</span><div><small>Нужна помощь?</small><strong>Открыть AI поддержку</strong></div>
        </section>
      </aside>

      <section className="as6-ref-workspace">
        <header className="as6-ref-hero">
          <div>
            <h1>Добро пожаловать, <span>Владимир!</span> 👋</h1>
            <p>Ваш AI Command Center. Управляйте, анализируйте и масштабируйте выручку.</p>
            <div className="as6-ref-badges"><strong>● Live-ready</strong><strong>● API подключён</strong></div>
          </div>
          <div className="as6-ref-topbar">
            <label>⌕ <input placeholder="Поиск..." /></label>
            <button>🔔<b>12</b></button><button>▱<b>3</b></button><button>?</button><button>A</button>
          </div>
        </header>

        <section className="as6-ref-kpis">
          {kpis.map((item) => (
            <article key={item.title} className={`as6-ref-kpi ${item.tone}`}>
              <small>{item.title}</small><div><strong>{item.value}</strong><i>{item.icon}</i></div><em>{item.delta}</em><span />
            </article>
          ))}
        </section>

        <section className="as6-ref-actions">
          {["👥 Создать лид", "$ Создать сделку", "▤ Добавить задачу", "🛡 Approval Queue", "〽 AI аналитика", "📊 Отчёты", "🤖 Настроить AI"].map((item) => <button key={item}>{item}</button>)}
        </section>

        <section className="as6-ref-main-grid">
          <div className="as6-ref-core">
            <div className="as6-ref-top-grid">
              <article className="as6-ref-card as6-ref-goal">
                <header><h3>Главная цель дня</h3><strong>68%</strong></header>
                <p>Увеличить выручку на $12,400 сегодня</p>
                <div className="as6-ref-progress"><span style={{ width: "68%" }} /></div>
                <footer><div><small>Ожидаемая выручка</small><b>$12,400</b></div><div><small>Вероятность</small><b>78%</b></div><div><small>Влияние на месяц</small><b>+$156,800</b></div></footer>
              </article>
              <article className="as6-ref-card as6-ref-pipeline">
                <header><h3>Pipeline Overview</h3><button>День</button></header>
                <div className="as6-ref-funnel">
                  {["Новые лиды|247|one", "Квалификация|198|two", "Презентация|123|three", "Переговоры|76|four", "Закрытие|34|five"].map((row) => { const [name, value, cls] = row.split("|"); return <div key={name}><small>{name}</small><span className={cls}>{value}</span></div>; })}
                </div>
                <aside><small>Сумма в процессе</small><b>$482,000</b><small>В выигрыше</small><b>$128,900</b><em>+4.8%</em></aside>
              </article>
            </div>
            <div className="as6-ref-bottom-grid">
              <article className="as6-ref-card"><header><h3>Производительность AI сотрудников</h3><button>Неделя</button></header>{agents.map((a) => <div className="as6-ref-agent" key={a[0]}><i>🤖</i><span>{a[0]}</span><b>{a[1]}</b><em>{a[2]}</em><div><span /></div></div>)}</article>
              <article className="as6-ref-card as6-ref-chart"><header><h3>Динамика выручки</h3><button>7 дней</button></header><h2>$2,940,000 <em>+9.8%</em></h2><div>{[42,55,50,67,61,78,72,86].map((h, i) => <span key={i} style={{ height: `${h}px` }} />)}</div></article>
              <article className="as6-ref-card as6-ref-ring"><h3>Цели на месяц</h3><div><strong>75%</strong><small>Выполнено</small></div></article>
            </div>
          </div>
          <aside className="as6-ref-right">
            <article className="as6-ref-copilot"><header><h3>AI Copilot</h3><strong>AS6</strong></header><div><img src="/assets/as6-copilot-asset-Tv9D6goR.png" alt="" /><button>Спросить AI Copilot</button></div></article>
            <article className="as6-ref-card as6-ref-events"><header><h3>Последние события</h3><button>Все</button></header>{["AI SDR Agent отправил письмо лиду", "Сделка Acme Corp перемещена в переговоры", "Новый лид из LinkedIn: Tech Solutions", "Сделка Globex Inc. закрыта успешно"].map((e, i) => <p key={e}><i>{["▣","🛡","👥","✅"][i]}</i><span>{e}</span><small>{[2,7,12,25][i]} мин назад</small></p>)}</article>
            <article className="as6-ref-card as6-ref-next"><h3>Быстрое действие</h3><p><i>⬇</i><span>Импорт лидов</span><b>+$4,200</b></p><p><i>🚀</i><span>Запустить кампанию</span><b>+$2,800</b></p></article>
          </aside>
        </section>
      </section>
    </main>
  );
}
