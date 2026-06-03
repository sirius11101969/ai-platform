import { useEffect, useMemo, useState } from 'react'
import { fetchAiCommandCenterBrief, fetchAiCommandCenterFocus, fetchAiCommandCenterKpi, fetchAiCommandCenterOperations, fetchAiCommandCenterPlanningMonthly } from '../services/api'

const demoMetrics = {
  revenueToday: '$1,248,890',
  leads: '247',
  deals: '87',
  aiEmployees: '28 / 28',
  conversion: '24.6%',
  pipelineTotal: '$4,782,000',
  wonTotal: '$1,248,890',
  monthlyTarget: '$16,600,000',
  monthlyActual: '$12,490,000',
  monthlyRemaining: '$4,110,000',
}

function pickMetric(value, fallback) {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'number' && value === 0) return fallback
  if (typeof value === 'string' && (!value.trim() || value.trim() === '0' || value.trim() === '$0')) return fallback
  return value
}

function formatMoney(value, fallback) {
  const selected = pickMetric(value, fallback)
  if (typeof selected === 'number') return `$${selected.toLocaleString('en-US')}`
  return selected
}

const kpiBlueprint = [
  { key: 'revenueToday', label: 'Выручка сегодня', value: demoMetrics.revenueToday, delta: '+18.6%', tone: 'revenue', icon: '↗' },
  { key: 'leads', label: 'Новые лиды', value: demoMetrics.leads, delta: '+32%', tone: 'leads', icon: '👥' },
  { key: 'deals', label: 'Сделки в работе', value: demoMetrics.deals, delta: '+14%', tone: 'deals', icon: '💼' },
  { key: 'aiEmployees', label: 'AI сотрудники', value: demoMetrics.aiEmployees, delta: 'Активны', tone: 'ai', icon: '🤖' },
  { key: 'conversion', label: 'Конверсия', value: demoMetrics.conversion, delta: '+8.3%', tone: 'conversion', icon: '◎' },
]

const funnelStages = [
  { label: 'Новые лиды', value: 247, width: 100, tone: 'blue' },
  { label: 'Квалификация', value: 198, width: 84, tone: 'green' },
  { label: 'Презентация', value: 123, width: 68, tone: 'yellow' },
  { label: 'Переговоры', value: 76, width: 52, tone: 'orange' },
  { label: 'Закрытие', value: 34, width: 36, tone: 'pink' },
]

const aiEmployees = [
  { name: 'AI SDR Agent', value: 156, suffix: '', progress: 86, delta: '+24%', avatar: '🤖', tone: 'cyan' },
  { name: 'AI Closer Agent', value: '$842k', suffix: '', progress: 78, delta: '+31%', avatar: '👨‍💼', tone: 'violet' },
  { name: 'AI Support Agent', value: 98, suffix: '%', progress: 72, delta: '+8%', avatar: '👩‍💻', tone: 'orange' },
  { name: 'AI Analyst', value: 124, suffix: '', progress: 91, delta: '+15%', avatar: '🧠', tone: 'green' },
]

const events = [
  { icon: '✉️', text: 'AI SDR Agent отправил письмо лиду', time: '2 мин назад' },
  { icon: '🛡️', text: 'Сделка Acme Corp перемещена в переговоры', time: '7 мин назад' },
  { icon: '👥', text: 'Новый лид из LinkedIn: Tech Solutions', time: '12 мин назад' },
  { icon: '✅', text: 'Сделка на $250,000 закрыта успешно', time: '25 мин назад' },
]

const nextActions = [
  { label: 'Позвонить Acme Corp', note: 'Высокий приоритет · Горячий лид', value: '+$4,200', icon: '📞' },
  { label: 'Одобрить 3 AI действия', note: 'Требует вашего решения', value: '+$2,800', icon: '🛡️' },
  { label: 'Отправить Follow-up 12 лидам', note: 'Высокий шанс ответа', value: '+$1,900', icon: '💌' },
]

const recommendations = [
  { title: 'Фокус: Высокий приоритет', text: 'Обработайте лидов из сектора SaaS сегодня. Потенциал: $56,400', action: 'Открыть лидов', tone: 'violet', icon: '👥' },
  { title: 'Возможность роста', text: 'Увеличьте конверсию на этапе презентации. Потенциал: +$3,200', action: 'Смотреть аналитику', tone: 'cyan', icon: '📊' },
  { title: 'Оптимизация', text: 'AI сотрудники могут обработать больше лидов. Потенциал: +$2,800', action: 'Настроить AI', tone: 'orange', icon: '⚡' },
  { title: 'Риск', text: '2 сделки могут быть потеряны без действия. Потенциал: -$4,500', action: 'Посмотреть сделки', tone: 'risk', icon: '💎' },
]

const quickActions = ['Создать лид', 'Создать сделку', 'Добавить задачу', 'Approval Queue', 'AI аналитика', 'Отчёты', 'Настроить AI']
const chartBars = [46, 64, 56, 78, 70, 92, 82, 100]

export default function CommandCenterPage() {
  const [apiState, setApiState] = useState({})

  useEffect(() => {
    let active = true
    Promise.allSettled([
      fetchAiCommandCenterBrief(),
      fetchAiCommandCenterOperations(),
      fetchAiCommandCenterFocus(),
      fetchAiCommandCenterKpi(),
      fetchAiCommandCenterPlanningMonthly(),
    ]).then((results) => {
      if (!active) return
      const [brief, operations, focus, kpi, monthly] = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      setApiState({ brief, operations, focus, kpi, monthly })
    })
    return () => { active = false }
  }, [])

  const kpis = useMemo(() => {
    const apiKpis = apiState.kpi?.kpis || {}
    const operations = apiState.operations?.operations || {}
    return kpiBlueprint.map((item) => {
      const liveValue = {
        revenueToday: apiKpis.revenueToday || apiState.brief?.executiveBrief?.revenueToday,
        leads: operations.completedToday || apiKpis.newLeads,
        deals: apiKpis.approvalQueueOpen || operations.needsAttention,
        aiEmployees: apiKpis.workforceUtilization ? `${apiKpis.workforceUtilization} / ${apiKpis.workforceUtilization}` : null,
        conversion: apiKpis.conversionRate,
      }[item.key]
      return { ...item, value: item.key === 'revenueToday' ? formatMoney(liveValue, item.value) : pickMetric(liveValue, item.value) }
    })
  }, [apiState])

  return (
    <main className="command-center-page" data-command-center-visual="premium-as6">
      <section className="command-hero" data-command-kpi-row>
        <div>
          <h1>Добро пожаловать, <span>Владимир!</span> 👋</h1>
          <p>Ваш AI Command Center. Управляйте, анализируйте и масштабируйте выручку.</p>
        </div>
        <div className="command-top-actions" aria-label="Command Center tools">
          <label className="command-search"><span>⌕</span><input type="search" placeholder="Поиск..." /></label>
          <button type="button" data-badge="12">🔔</button>
          <button type="button" data-badge="3">💬</button>
          <button type="button">?</button>
          <button type="button" className="command-avatar">A</button>
        </div>
      </section>

      <section className="command-kpis">
        {kpis.map((item) => <article className={`command-kpi ${item.tone}`} key={item.key}>
          <div><span>{item.label}</span><strong>{item.value}</strong><em>{item.delta}</em></div><i>{item.icon}</i>
        </article>)}
      </section>

      <section className="command-main-grid">
        <div className="command-core">
          <section className="command-top-grid">
            <article className="command-card daily-goal">
              <div className="command-card-head"><h2>Главная цель дня</h2><span>68%</span></div>
              <p>Увеличить выручку на $12,400 сегодня</p>
              <div className="goal-progress"><span style={{ width: '68%' }} /></div>
              <div className="goal-stats">
                <div><small>Expected revenue</small><strong>$12,400</strong></div>
                <div><small>Probability</small><strong>78%</strong></div>
                <div><small>Monthly impact</small><strong>+$156,800</strong></div>
              </div>
            </article>

            <article className="command-card pipeline-card" data-pipeline-funnel>
              <div className="command-card-head"><h2>Pipeline Overview</h2><button type="button">Этот месяц⌄</button></div>
              <div className="pipeline-layout">
                <div className="pipeline-funnel">
                  {funnelStages.map((stage) => <div className="funnel-row" key={stage.label}>
                    <span>{stage.label}</span><strong className={`funnel-slice ${stage.tone}`} style={{ width: `${stage.width}%` }}>{stage.value}</strong>
                  </div>)}
                </div>
                <div className="pipeline-summary">
                  <small>Сумма в процессе</small><strong>{demoMetrics.pipelineTotal}</strong>
                  <small>В выигрыше</small><strong>{demoMetrics.wonTotal}</strong><em>+18.6%</em>
                </div>
              </div>
            </article>
          </section>

          <section className="command-second-grid">
            <article className="command-card employee-performance">
              <div className="command-card-head"><h2>Производительность AI сотрудников</h2><button type="button">Неделя⌄</button></div>
              {aiEmployees.map((agent) => <div className="agent-row" key={agent.name}>
                <b>{agent.avatar}</b><span>{agent.name}</span><strong>{agent.value}{agent.suffix}</strong><em>{agent.delta}</em>
                <div className="agent-progress"><i className={agent.tone} style={{ width: `${agent.progress}%` }} /></div>
              </div>)}
            </article>

            <article className="command-card revenue-dynamics">
              <div className="command-card-head"><h2>Динамика выручки</h2><button type="button">30 дней⌄</button></div>
              <strong className="chart-total">$12,490,000 <em>+22.4%</em></strong>
              <div className="mock-chart">{chartBars.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}<svg viewBox="0 0 240 100" preserveAspectRatio="none"><polyline points="0,76 34,58 68,66 102,38 136,52 170,24 204,36 240,12" /></svg></div>
            </article>

            <article className="command-card month-goals">
              <h2>Цели на месяц</h2>
              <div className="circle-progress" style={{ '--progress': '75%' }}><strong>75%</strong><span>Выполнено</span></div>
              <dl><div><dt>Цель</dt><dd>{demoMetrics.monthlyTarget}</dd></div><div><dt>Факт</dt><dd>{demoMetrics.monthlyActual}</dd></div><div><dt>Осталось</dt><dd>{demoMetrics.monthlyRemaining}</dd></div></dl>
            </article>
          </section>
        </div>

        <aside className="command-right-rail" data-right-action-rail>
          <article className="command-card copilot-hero" data-copilot-hero>
            <div className="copilot-top"><h2>AI Copilot</h2><span>AS6</span></div><div className="robot-icon">🤖</div>
            <p>Я здесь, чтобы помочь вам принимать лучшие решения и достигать целей быстрее.</p><button type="button">Спросить AI Copilot →</button>
          </article>
          <article className="command-card event-card"><div className="command-card-head"><h2>Последние события</h2><a href="/dashboard">Все</a></div>{events.map((event) => <div className="event-row" key={event.text}><b>{event.icon}</b><span>{event.text}</span><time>{event.time}</time></div>)}</article>
          <article className="command-card next-action-card"><h2>Следующее лучшее действие</h2>{nextActions.map((action) => <div className="next-action" key={action.label}><b>{action.icon}</b><span>{action.label}<small>{action.note}</small></span><strong>{action.value}</strong></div>)}<div className="expected-effect"><span>Ожидаемый эффект</span><strong>+$8,900</strong></div></article>
        </aside>
      </section>

      <section className="command-recommendations" data-ai-recommendations>
        <h2>AI рекомендации</h2><div>{recommendations.map((card) => <article className={`recommendation ${card.tone}`} key={card.title}><b>{card.icon}</b><strong>{card.title}</strong><p>{card.text}</p><button type="button">{card.action} →</button></article>)}</div>
      </section>

      <section className="quick-actions" data-quick-actions><h2>Быстрые действия</h2><div>{quickActions.map((action, index) => <button type="button" key={action}><span>{['👥', '$', '🧾', '🛡️', '〽️', '📊', '⚙️'][index]}</span>{action}</button>)}</div></section>
    </main>
  )
}
