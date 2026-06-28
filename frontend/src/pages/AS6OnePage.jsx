import as6CopilotLogo from '../assets/as6-copilot-asset.png'
import { BellIcon, ChatIcon, HelpIcon } from '../components/icons/TopbarIcons.jsx'

const navigationMarker = 'as6-command-center-shell-foundation'

const intelligenceMetrics = [
  { label: 'прогноз 7 дней', value: '+18%', note: '+487 000 ₽ к плану', tone: 'cyan' },
  { label: 'горячие лиды', value: '42', note: 'готовы к контакту', tone: 'violet' },
  { label: 'риск-сделки', value: '7', note: 'нужен перезапуск', tone: 'orange' },
  { label: 'AS6-оценка', value: '94', note: 'ростовой режим', tone: 'green' },
]

const revenueColumns = [
  { title: 'Новый', amount: '1 280 000 ₽', count: '18 лидов', items: ['Альфа Групп', 'Neon Retail', 'Solaris'] },
  { title: 'Квалификация', amount: '940 000 ₽', count: '11 сделок', items: ['ТехноПарк', 'Nord Labs'] },
  { title: 'Предложение', amount: '1 740 000 ₽', count: '8 сделок', items: ['Mercury', 'Vector AI'] },
  { title: 'Встреча', amount: '860 000 ₽', count: '4 встречи', items: ['Альфа', 'FinBridge'] },
  { title: 'Успешно', amount: '2 120 000 ₽', count: '6 побед', items: ['AS6 Pilot', 'Growth Pack'] },
]

const timeline = [
  { time: '09:42', text: 'AS6 работает: найдено 12 follow-up с высоким шансом ответа' },
  { time: '10:15', text: 'Рекомендация AS6: позвонить Альфа до 12:00' },
  { time: '11:20', text: 'Поток выручки обновлён: 4 сделки готовы к закрытию' },
]

export default function AS6OnePage() {
  return (
    <main
      className="command-center-page as6-one-page"
      data-command-center-visual="premium-as6"
      data-as6-page="AS6OnePage"
      data-as6-route="as6-one"
      data-as6-core="as6-core"
      data-as6-shell-foundation={navigationMarker}
      data-as6-living-company="as6-living-company"
      data-as6-revenue-flow="as6-revenue-flow"
    >
      <section className="command-hero as6-one-living-hero">
        <div>
          <span className="as6-one-kicker">AS6 CORE</span>
          <h1>Живой интеллект компании</h1>
          <p>Сегодня компания рекомендует: закрыть 4 сделки, позвонить Альфа, перезапустить переговоры и отправить 12 follow-up.</p>
          <div className="command-live-status"><a className="green" href="#growth-plan">Ожидаемый рост +487 000 ₽</a><a href="#core">AS6 работает</a></div>
        </div>
        <div className="command-top-actions" aria-label="AS6 ONE tools">
          <label className="command-search"><span>⌕</span><input type="search" placeholder="Спросить компанию" /></label>
          <a href="#timeline" className="top-icon" data-badge="12" aria-label="Уведомления"><BellIcon /></a><a href="#assistant" className="top-icon" data-badge="4" aria-label="AS6 Помощник"><ChatIcon /></a><a href="#system" className="top-icon" aria-label="Помощь"><HelpIcon /></a><a href="#profile" className="command-avatar top-icon-profile" aria-label="Профиль">A</a>
        </div>
      </section>

      <section className="quick-actions quick-actions-primary as6-one-growth-plan" id="growth-plan">
        <h2>Сегодня компания рекомендует</h2>
        <div>
          {['Закрыть 4 сделки', 'Позвонить Альфа', 'Перезапустить переговоры', 'Отправить 12 follow-up'].map((action, index) => <a href="#core" key={action}><span>{['✓', '☎', '↻', '✉'][index]}</span>{action}</a>)}
        </div>
        <a className="as6-one-primary-button" href="#core">Показать план роста</a>
      </section>

      <section className="command-main-grid">
        <div className="command-core">
          <section className="command-top-grid as6-one-core-grid" id="core">
            <article className="command-card as6-one-intelligence-card">
              <div className="command-card-head"><h2>AS6 CORE Intelligence</h2><span>прогноз 7 дней</span></div>
              <div className="as6-one-intelligence-metrics">{intelligenceMetrics.map((metric) => <div className={`as6-one-metric ${metric.tone}`} key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.note}</small></div>)}</div>
              <div className="as6-one-health"><span>здоровье воронки</span><strong>87%</strong><em>следующее лучшее действие: связаться с Альфа</em></div>
            </article>
          </section>

          <section className="command-second-grid as6-one-revenue-flow" data-as6-revenue-flow="as6-revenue-flow">
            <article className="command-card as6-one-pipeline-card">
              <div className="command-card-head"><h2>Поток выручки</h2><span>живой pipeline</span></div>
              <div className="as6-one-kanban">{revenueColumns.map((column) => <div className="as6-one-kanban-column" key={column.title}><h3>{column.title}</h3><strong>{column.amount}</strong><small>{column.count}</small>{column.items.map((item) => <span key={item}>{item}</span>)}</div>)}</div>
            </article>
          </section>
        </div>

        <aside className="command-right-rail" id="assistant" data-right-action-rail data-copilot-rail>
          <article className="command-card copilot-hero"><div className="copilot-top"><h2>AS6 Помощник</h2><span>AS6</span></div><div className="copilot-inline-layout"><img className="as6-copilot-inline-logo" src={as6CopilotLogo} alt="AS6 Помощник" /><a className="copilot-action-link" href="#assistant">Спросить компанию</a></div></article>
          <article className="command-card next-action-card"><h2>Рекомендация AS6</h2><div className="next-action"><b>✦</b><span>Закрыть 4 сделки<small>максимальный прирост сегодня</small></span><strong>+487 000 ₽</strong></div></article>
          <article className="command-card event-card" id="timeline"><div className="command-card-head"><h2>AS6 Timeline</h2><a href="#core">Все</a></div>{timeline.map((event) => <div className="event-row" key={event.text}><b>{event.time}</b><span>{event.text}</span><time>live</time></div>)}</article>
          <article className="command-card event-card" id="system"><div className="command-card-head"><h2>Состояние системы</h2><span>GREEN</span></div>{['AS6 CORE', 'AS6 Сотрудники', 'AS6 Автоматизация'].map((item) => <div className="event-row" key={item}><b>●</b><span>{item}</span><time>готово</time></div>)}</article>
        </aside>
      </section>
    </main>
  )
}
