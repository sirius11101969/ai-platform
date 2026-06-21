import React from "react";
import "../styles/as6-command-center-appshell-reference.css";

const kpis = [
  { title: "Выручка сегодня", value: "$1,248,890", delta: "+18.6%", icon: "↗", tone: "green" },
  { title: "Новые лиды", value: "247", delta: "+32%", icon: "👥", tone: "blue" },
  { title: "Сделки в работе", value: "87", delta: "+14%", icon: "💼", tone: "orange" },
  { title: "AI сотрудники", value: "28 / 28", delta: "Активны", icon: "🤖", tone: "cyan" },
  { title: "Конверсия", value: "24.6%", delta: "+8.3%", icon: "◎", tone: "purple" }
];

const agents = [
  ["🤖", "AI SDR Agent", "156", "+24%"],
  ["🤖", "AI Closer Agent", "$842k", "+31%"],
  ["🤖", "AI Manager Agent", "289", "+18%"]
];

const events = [
  ["▣", "AI SDR Agent отправил письмо лиду", "2 мин назад"],
  ["🛡", "Сделка Acme Corp перемещена в переговоры", "7 мин назад"],
  ["👥", "Новый лид из LinkedIn: Tech Solutions", "12 мин назад"],
  ["✅", "Сделка Globex Inc. закрыта успешно", "25 мин назад"]
];

export default function CommandCenterPage() {
  return (
    <main className="as6-command-center-appshell-reference">
      <header className="as6-cc-hero">
        <div>
          <h1>Добро пожаловать, <span>Владимир!</span> 👋</h1>
          <p>Ваш AI Command Center. Управляйте, анализируйте и масштабируйте выручку.</p>
          <div className="as6-cc-badges"><strong>● Live-ready</strong><strong>● API подключён</strong></div>
        </div>
        <div className="as6-cc-topbar">
          <label>⌕ <input placeholder="Поиск..." /></label>
          <button>🔔<b>12</b></button><button>▱<b>3</b></button><button>?</button><button>A</button>
        </div>
      </header>

      <section className="as6-cc-kpis">
        {kpis.map((item) => (
          <article key={item.title} className={`as6-cc-kpi ${item.tone}`}>
            <small>{item.title}</small>
            <div><strong>{item.value}</strong><i>{item.icon}</i></div>
            <em>{item.delta}</em>
            <span />
          </article>
        ))}
      </section>

      <section className="as6-cc-actions">
        {["👥 Создать лид", "$ Создать сделку", "▤ Добавить задачу", "🛡 Approval Queue", "〽 AI аналитика", "📊 Отчёты", "🤖 Настроить AI"].map((item) => <button key={item}>{item}</button>)}
      </section>

      <section className="as6-cc-main-grid">
        <div className="as6-cc-core">
          <div className="as6-cc-top-grid">
            <article className="as6-cc-card as6-cc-goal">
              <header><h3>Главная цель дня</h3><strong>68%</strong></header>
              <p>Увеличить выручку на $12,400 сегодня</p>
              <div className="as6-cc-progress"><span style={{ width: "68%" }} /></div>
              <footer><div><small>Ожидаемая выручка</small><b>$12,400</b></div><div><small>Вероятность</small><b>78%</b></div><div><small>Влияние на месяц</small><b>+$156,800</b></div></footer>
            </article>

            <article className="as6-cc-card as6-cc-pipeline">
              <header><h3>Pipeline Overview</h3><button>День</button></header>
              <div className="as6-cc-funnel">
                {["Новые лиды|247|one", "Квалификация|198|two", "Презентация|123|three", "Переговоры|76|four", "Закрытые|34|five"].map((row) => { const [name, value, cls] = row.split("|"); return <div key={name}><small>{name}</small><span className={cls}>{value}</span></div>; })}
              </div>
              <aside><small>Сумма в процессе</small><b>$482,000</b><small>В выигрыше</small><b>$128,900</b><em>+4.8%</em></aside>
            </article>
          </div>

          <div className="as6-cc-bottom-grid">
            <article className="as6-cc-card as6-cc-agents">
              <header><h3>Производительность AI сотрудников</h3><button>Неделя</button></header>
              {agents.map((a) => <div className="as6-cc-agent" key={a[1]}><i>{a[0]}</i><span>{a[1]}</span><b>{a[2]}</b><em>{a[3]}</em><div><span /></div></div>)}
            </article>
            <article className="as6-cc-card as6-cc-chart"><header><h3>Динамика выручки</h3><button>7 дней</button></header><h2>$2,940,000 <em>+9.8%</em></h2><div>{[42,55,50,67,61,78,72,86].map((h, i) => <span key={i} style={{ height: `${h}px` }} />)}</div></article>
            <article className="as6-cc-card as6-cc-ring"><h3>Цели на месяц</h3><div><strong>75%</strong><small>Выполнено</small></div></article>
          </div>
        </div>

        <aside className="as6-cc-right">
          <article className="as6-cc-copilot"><header><h3>AI Copilot</h3><strong>AS6</strong></header><div><img src="/assets/as6-copilot-asset-Tv9D6goR.png" alt="" /><button>Спросить AI Copilot</button></div></article>
          <article className="as6-cc-card as6-cc-events"><header><h3>Последние события</h3><button>Все</button></header>{events.map((e) => <p key={e[1]}><i>{e[0]}</i><span>{e[1]}</span><small>{e[2]}</small></p>)}</article>
          <article className="as6-cc-card as6-cc-next"><h3>Быстрое действие</h3><p><i>⬇</i><span>Импорт лидов</span><b>+$4,200</b></p><p><i>🚀</i><span>Запустить кампанию</span><b>+$2,800</b></p></article>
        </aside>
      </section>
    </main>
  );
}
