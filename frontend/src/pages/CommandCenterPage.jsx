import as6CopilotLogo from '../assets/as6-copilot-asset.png';
import as6Logo from '../assets/as6-logo.png';
import { BellIcon, ChatIcon, HelpIcon } from '../components/icons/TopbarIcons.jsx'
import { useEffect, useMemo, useState } from 'react'
import { fetchAiCommandCenterActions, fetchAiCommandCenterBrief, fetchAiCommandCenterFocus, fetchAiCommandCenterInbox, fetchAiCommandCenterKpi, fetchAiCommandCenterOperations, fetchAiCommandCenterPlanningMonthly, fetchAiSystemHealth } from '../services/api'
import as6Robot from "../assets/as6-robot.png"

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
  if (typeof value === 'string' && (!value.trim() || value.trim() === '0' || value.trim() === '$0' || value.trim() === '0%')) return fallback
  return value
}

function formatMoney(value, fallback) {
  const selected = pickMetric(value, fallback)
  if (typeof selected === 'number') return `$${selected.toLocaleString('en-US')}`
  return selected
}

const kpiBlueprint = [
  { key: 'revenueToday', label: 'Выручка сегодня', value: demoMetrics.revenueToday, delta: '+18.6%', tone: 'revenue', icon: '↗', spark: [18, 25, 20, 28, 24, 31, 42] },
  { key: 'leads', label: 'Новые лиды', value: demoMetrics.leads, delta: '+32%', tone: 'leads', icon: '👥', spark: [16, 22, 34, 31, 42, 50, 58] },
  { key: 'deals', label: 'Сделки в работе', value: demoMetrics.deals, delta: '+14%', tone: 'deals', icon: '💼', spark: [45, 36, 40, 32, 48, 52, 59] },
  { key: "aiEmployees", label: "AI сотрудники", value: demoMetrics.aiEmployees, delta: "Активны", tone: "ai", icon: <img src={as6Robot} alt="AS6 AI Workforce" className="as6-ai-kpi-robot-image" />, spark: [52, 50, 54, 53, 55, 56, 58] },
  { key: 'conversion', label: 'Конверсия', value: demoMetrics.conversion, delta: '+8.3%', tone: 'conversion', icon: '◎', spark: [21, 26, 24, 31, 35, 39, 46] },
]

const funnelStages = [
  { label: 'Новые лиды', value: 247, width: 100, tone: 'blue' },
  { label: 'Квалификация', value: 198, width: 84, tone: 'green' },
  { label: 'Презентация', value: 123, width: 68, tone: 'yellow' },
  { label: 'Переговоры', value: 76, width: 52, tone: 'orange' },
  { label: 'Закрытие', value: 34, width: 36, tone: 'pink' },
]

const aiEmployees = [
  { name: 'AI SDR Agent', value: 156, suffix: '', progress: 86, delta: '+24%', avatar: <img src={as6Robot} alt="AS6 AI SDR Agent" className="agent-avatar-image" />, tone: 'cyan' },
  { name: 'AI Closer Agent', value: '$842k', suffix: '', progress: 78, delta: '+31%', avatar: <img src={as6Robot} alt="AS6 AI Closer Agent" className="agent-avatar-image" />, tone: 'violet' },
  { name: 'AI Support Agent', value: 98, suffix: '%', progress: 72, delta: '+8%', avatar: <img src={as6Robot} alt="AS6 AI Support Agent" className="agent-avatar-image" />, tone: 'orange' },
  { name: 'AI Analyst', value: 124, suffix: '', progress: 91, delta: '+15%', avatar: <img src={as6Robot} alt="AS6 AI Analyst" className="agent-avatar-image" />, tone: 'green' },
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
  { title: 'Фокус: Высокий приоритет', text: 'Обработайте лидов из сектора SaaS сегодня. Потенциал: $56,400', action: 'Открыть лидов', href: '/crm?filter=priority', tone: 'violet', icon: '👥' },
  { title: 'Возможность роста', text: 'Увеличьте конверсию на этапе презентации. Потенциал: +$3,200', action: 'Смотреть аналитику', href: '/ai-revenue-intelligence', tone: 'cyan', icon: '📊' },
  { title: 'Оптимизация', text: 'AI сотрудники могут обработать больше лидов. Потенциал: +$2,800', action: 'Настроить AI', href: '/ai-workforce-center', tone: 'orange', icon: '⚡' },
  { title: 'Риск', text: '2 сделки могут быть потеряны без действия. Потенциал: -$4,500', action: 'Посмотреть сделки', href: '/ai-executive-brain', tone: 'risk', icon: '💎' },
]


const executiveModules = [
  { title: 'Revenue Intelligence', text: 'Выручка, воронка, прогноз и возможности роста', href: '/ai-revenue-intelligence', icon: '📈', tone: 'cyan' },
  { title: 'AI Workforce', text: 'AI сотрудники, загрузка, эффективность и задачи', href: '/ai-workforce-center', icon: <img src={as6Robot} alt="AI Workforce" className="executive-module-robot-icon" />, tone: 'violet' },
  { title: 'Strategic Planning', text: 'Цели, планы, недельные и месячные приоритеты', href: '/ai-strategic-planning', icon: '🧭', tone: 'green' },
  { title: 'Execution Center', text: 'Исполнение, операции, действия и контроль результата', href: '/ai-execution-center', icon: '⚡', tone: 'orange' },
  { title: 'Approval Center', text: 'Очередь решений, approvals и human-in-the-loop контроль', href: '/ai-approval-center', icon: '🛡️', tone: 'pink' },
  { title: 'System Health', text: 'AS6, backend, диагностика, стабильность и readiness', href: '/ai-system-health-center', icon: '🟢', tone: 'blue' },
]

const quickActionLinks = {
  "Создать лид": "/crm?quick=create-lead",
  "Создать сделку": "/crm?quick=create-deal",
  "Добавить задачу": "/followups?quick=create-task",
  "Approval Queue": "/ai-approval-center",
  "AI аналитика": "/ai-revenue-intelligence",
  "Отчёты": "/dashboard/revenue",
  "Настроить AI": "/ai-enterprise-coordination",
}

const quickActions = ['Создать лид', 'Создать сделку', 'Добавить задачу', 'Approval Queue', 'AI аналитика', 'Отчёты', 'Настроить AI']
const chartBars = [46, 64, 56, 78, 70, 92, 82, 100]
const monthFallback = { target: demoMetrics.monthlyTarget, actual: demoMetrics.monthlyActual, remaining: demoMetrics.monthlyRemaining }

function sparklinePoints(values) {
  return values.map((value, index) => `${index * (100 / (values.length - 1))},${64 - value}`).join(' ')
}

export default function CommandCenterPage() {
  const [apiState, setApiState] = useState({})
  const [apiLoading, setApiLoading] = useState(true)
  const [apiErrors, setApiErrors] = useState([])
  const [pipelinePeriod, setPipelinePeriod] = useState('day')
  const [revenueRange, setRevenueRange] = useState('7d')

  const pipelineSummary = useMemo(() => ({
    day: { process: '$482,000', won: '$128,900', growth: '+4.8%' },
    week: { process: '$1,840,000', won: '$642,000', growth: '+12.4%' },
    month: { process: '$4,782,000', won: '$1,248,890', growth: '+18.6%' },
    quarter: { process: '$12,760,000', won: '$3,890,000', growth: '+18.6%' },
    year: { process: '$48,900,000', won: '$14,820,000', growth: '+18.6%' },
  }[pipelinePeriod] || { process: '$4,782,000', won: '$1,248,890', growth: '+18.6%' }), [pipelinePeriod])

  const revenueSummary = useMemo(() => ({
    '1d': { total: '$428,000', growth: '+3.1%' },
    '7d': { total: '$2,940,000', growth: '+9.8%' },
    '30d': { total: '$12,490,000', growth: '+22.4%' },
    '90d': { total: '$31,800,000', growth: '+22.4%' },
    '365d': { total: '$128,400,000', growth: '+22.4%' },
  }[revenueRange] || { total: '$12,490,000', growth: '+22.4%' }), [revenueRange])
  const [workforceRange, setWorkforceRange] = useState('week')

  useEffect(() => {
    let active = true
    setApiLoading(true)
    Promise.allSettled([
      fetchAiCommandCenterBrief(),
      fetchAiCommandCenterOperations(),
      fetchAiCommandCenterFocus(),
      fetchAiCommandCenterKpi(),
      fetchAiCommandCenterPlanningMonthly(),
      fetchAiCommandCenterActions(),
      fetchAiCommandCenterInbox(),
      fetchAiSystemHealth(),
    ]).then((results) => {
      if (!active) return
      const names = ['brief', 'operations', 'focus', 'kpi', 'monthly', 'actions', 'inbox', 'health']
      const payload = {}
      const errors = []
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') payload[names[index]] = result.value
        else errors.push(names[index])
      })
      setApiState(payload)
      setApiErrors(errors)
      setApiLoading(false)
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

  const monthly = useMemo(() => {
    const live = apiState.monthly?.planning || apiState.focus?.monthly || {}
    return {
      target: formatMoney(live.targetRevenue || live.revenueTarget, monthFallback.target),
      actual: formatMoney(live.actualRevenue || live.revenueActual, monthFallback.actual),
      remaining: formatMoney(live.remainingRevenue || live.revenueRemaining, monthFallback.remaining),
    }
  }, [apiState])

  const executiveBrief = useMemo(() => {
    const brief = apiState.brief?.executiveBrief || apiState.brief?.brief || {}
    return {
      title: brief.title || 'AI Executive Brief',
      summary: brief.summary || brief.text || 'Сегодня система работает в live-ready режиме: данные Command Center подключены через защищённые API, а интерфейс показывает fallback до получения авторизованного ответа.',
      focus: brief.focus || apiState.focus?.focus || 'Сфокусироваться на выручке, одобрениях AI-действий и рисках в pipeline.',
      risk: brief.risk || brief.risks?.[0] || 'Критичных production-рисков не отображено. Проверьте approval queue и сделки с высоким приоритетом.',
      opportunity: brief.opportunity || brief.opportunities?.[0] || 'Ускорить обработку лидов через AI Workforce и follow-up automation.',
    }
  }, [apiState])

  const systemStatus = useMemo(() => ([
    { label: 'Production', value: 'GREEN' },
    { label: 'Diagnostics', value: 'GREEN' },
    { label: 'Governance', value: 'GREEN' },
    { label: 'AI Workforce', value: pickMetric(apiState.kpi?.kpis?.workforceStatus, 'READY') },
    { label: 'API', value: apiErrors.length ? 'AUTH REQUIRED' : (apiLoading ? 'LOADING' : 'LIVE') },
  ]), [apiErrors.length, apiLoading, apiState])

  const actionQueue = useMemo(() => {
    const list = apiState.actions?.actions || apiState.actions?.items || []
    if (Array.isArray(list) && list.length) return list.slice(0, 4).map((item, index) => ({
      title: item.title || item.name || `AI действие #${index + 1}`,
      meta: item.status || item.priority || 'Требует решения',
      value: item.impact || item.value || 'Review',
    }))
    return [
      { title: 'Одобрить AI follow-up', meta: 'Approval Queue · высокий приоритет', value: '+$2,800' },
      { title: 'Проверить риск сделки', meta: 'Pipeline · требуется внимание', value: 'Risk' },
      { title: 'Запустить AI outreach', meta: 'Growth · готово к запуску', value: '+12 лидов' },
    ]
  }, [apiState])

  const inboxItems = useMemo(() => {
    const list = apiState.inbox?.items || apiState.inbox?.messages || apiState.inbox?.inbox || []
    if (Array.isArray(list) && list.length) return list.slice(0, 4).map((item, index) => ({
      title: item.title || item.subject || `Сообщение #${index + 1}`,
      meta: item.from || item.source || item.time || 'AI Inbox',
    }))
    return [
      { title: 'Новые лиды ожидают квалификации', meta: 'AI Inbox · today' },
      { title: '3 действия ожидают approval', meta: 'Approval Center' },
      { title: 'Еженедельный план готов к проверке', meta: 'Strategic Planning' },
    ]
  }, [apiState])

  const healthSummary = useMemo(() => {
    const health = apiState.health || {}
    return [
      { label: 'Backend', value: health.backend || health.status || 'OK' },
      { label: 'Database', value: health.database || 'OK' },
      { label: 'Redis', value: health.redis || 'OK' },
      { label: 'AS6', value: health.as6 || 'GREEN' },
    ]
  }, [apiState])

  const businessSummary = useMemo(() => ([
    { label: 'Revenue', value: monthly.actual, note: `Цель: ${monthly.target}` },
    { label: 'AI Workforce', value: pickMetric(apiState.kpi?.kpis?.workforceUtilization, 'READY'), note: 'Исполнение и автоматизация' },
    { label: 'Planning', value: pickMetric(apiState.monthly?.planning?.status, 'ACTIVE'), note: `Осталось: ${monthly.remaining}` },
  ]), [apiState, monthly])

  const executiveStream = useMemo(() => {
    const items = [
      { type: 'Revenue', title: 'Финансовый фокус', text: `Факт месяца: ${monthly.actual}. Осталось до цели: ${monthly.remaining}.`, status: 'LIVE' },
      { type: 'Approvals', title: 'Очередь решений', text: `${actionQueue.length} AI-действия готовы к проверке.`, status: actionQueue.length ? 'ACTION' : 'CLEAR' },
      { type: 'Inbox', title: 'AI Inbox', text: `${inboxItems.length} входящих executive-сигнала.`, status: inboxItems.length ? 'REVIEW' : 'CLEAR' },
      { type: 'Health', title: 'Стабильность системы', text: `AS6: ${healthSummary.find((x) => x.label === 'AS6')?.value || 'GREEN'}.`, status: 'GREEN' },
      { type: 'Planning', title: 'Планирование', text: businessSummary.find((x) => x.label === 'Planning')?.note || 'План активен.', status: 'ACTIVE' },
    ]
    return items
  }, [monthly, actionQueue, inboxItems, healthSummary, businessSummary])




  return (
    <main className="command-center-page" data-command-center-visual="premium-as6" data-as6-diagnostic-page="command-center-premium">
<img className="as6-command-center-logo-image" src={as6Logo} alt="AS6" />
      <section className="command-hero" data-as6-diagnostic-hero="executive-command-center">
        <div>
          <h1>Добро пожаловать, <span>Владимир!</span> 👋</h1>
          <p>Ваш AI Command Center. Управляйте, анализируйте и масштабируйте выручку.</p>
          <div className="command-live-status"><a className={apiLoading ? 'loading' : 'green'} href="/ai-system-health-center">{apiLoading ? 'Синхронизация...' : 'Live-ready'}</a><a href="/ai-system-health-center">{apiErrors.length ? `API требует авторизацию: ${apiErrors.length}` : 'API подключён'}</a></div>
        </div>
        <div className="command-top-actions" aria-label="Command Center tools">
          <label className="command-search"><span>⌕</span><input type="search" placeholder="Поиск..." /></label>
          <a href="/followups" className="top-icon" data-badge="12" aria-label="Уведомления"><BellIcon /></a><a href="/priority-inbox" className="top-icon" data-badge="3" aria-label="AI коммуникации"><ChatIcon /></a><a href="/ai-system-health-center" className="top-icon" aria-label="Помощь"><HelpIcon /></a><a href="/profile" className="command-avatar top-icon-profile" aria-label="Профиль">A</a>
        </div>
      </section>

      <section className="command-kpis" data-command-kpi-row data-as6-diagnostic-kpis="executive-kpi-row">
        {kpis.map((item) => <article className={`command-kpi ${item.tone}`} key={item.key}>
          <div className="kpi-copy"><span>{item.label}</span><strong>{item.value}</strong><em>{item.delta}</em></div>
          <svg className="kpi-spark" viewBox="0 0 100 64" preserveAspectRatio="none" aria-hidden="true"><polyline points={sparklinePoints(item.spark)} /></svg>
          <i>{item.icon}</i>
        </article>)}
      </section>



      <section className="quick-actions quick-actions-primary" data-quick-actions data-as6-primary-actions="above-fold"><h2>Быстрые действия</h2><div>{quickActions.map((action, index) => <a href={quickActionLinks[action] || "#"} role="button" key={action} aria-label={action}><span>{["👥", "$", "🧾", "🛡️", "〽️", "📊", <img src={as6Robot} alt="AI" className="quick-action-robot-icon" />][index]}</span>{action}</a>)}</div></section>

      <section className="command-main-grid">
        <div className="command-core">
          <section className="command-top-grid">
            <article className="command-card daily-goal">
              <div className="command-card-head"><h2>Главная цель дня</h2><span>68%</span></div>
              <p>Увеличить выручку на $12,400 сегодня</p>
              <div className="goal-progress"><span style={{ width: '68%' }} /></div>
              <div className="goal-stats">
                <div><small>Ожидаемая выручка</small><strong>$12,400</strong></div>
                <div><small>Вероятность</small><strong>78%</strong></div>
                <div><small>Влияние на месяц</small><strong>+$156,800</strong></div>
              </div>
            </article>

            <article className="command-card pipeline-card" data-pipeline-funnel>
              <div className="command-card-head"><h2>Pipeline Overview</h2><select className="command-filter-select" value={pipelinePeriod} onChange={(event) => setPipelinePeriod(event.target.value)} aria-label="Pipeline period"><option value="day">День</option><option value="week">Неделя</option><option value="month">Месяц</option><option value="quarter">Квартал</option><option value="year">Год</option></select></div>
              <div className="pipeline-layout">
                <div className="pipeline-funnel">
                  {funnelStages.map((stage) => <div className="funnel-row" key={stage.label}>
                    <span>{stage.label}</span><strong className={`funnel-slice screenshot-funnel-slice ${stage.tone}`} style={{ '--stage-width': `${stage.width}%` }}><em>{stage.value}</em></strong>
                  </div>)}
                </div>
                <div className="pipeline-summary"><small>Сумма в процессе</small><strong>{pipelineSummary.process}</strong><small>В выигрыше</small><strong>{pipelineSummary.won}</strong><em>{pipelineSummary.growth}</em></div>
              </div>
            </article>
          </section>

          <section className="command-second-grid">
            <article className="command-card employee-performance">
              <div className="command-card-head"><h2>Производительность AI сотрудников</h2><select className="command-filter-select" value={workforceRange} onChange={(event) => setWorkforceRange(event.target.value)} aria-label="AI workforce period"><option value="today">Сегодня</option><option value="week">Неделя</option><option value="month">Месяц</option></select></div>
              {aiEmployees.map((agent) => <div className="agent-row" key={agent.name}>
                <b>{agent.avatar}</b><span>{agent.name}</span><strong>{agent.value}{agent.suffix}</strong><em>{agent.delta}</em>
                <div className="agent-progress"><i className={agent.tone} style={{ width: `${agent.progress}%` }} /></div>
              </div>)}
            </article>

            <article className="command-card revenue-dynamics">
              <div className="command-card-head"><h2>Динамика выручки</h2><select className="command-filter-select" value={revenueRange} onChange={(event) => setRevenueRange(event.target.value)} aria-label="Revenue range"><option value="1d">День</option><option value="7d">7 дней</option><option value="30d">30 дней</option><option value="90d">90 дней</option><option value="365d">365 дней</option></select></div>
              <strong className="chart-total">{revenueRange === '1d' ? '$428,000' : revenueRange === '7d' ? '$2,940,000' : revenueRange === '90d' ? '$31,800,000' : revenueRange === '365d' ? '$128,400,000' : '$12,490,000'} <em>{revenueRange === '1d' ? '+3.1%' : revenueRange === '7d' ? '+9.8%' : '+22.4%'}</em></strong>
              <div className="mock-chart">{chartBars.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}<svg viewBox="0 0 240 100" preserveAspectRatio="none"><polyline points="0,76 34,58 68,66 102,38 136,52 170,24 204,36 240,12" /></svg></div>
            </article>

            <article className="command-card month-goals">
              <h2>Цели на месяц</h2>
              <div className="circle-progress" style={{ '--progress': '75%' }}><strong>75%</strong><span>Выполнено</span></div>
              <dl><div><dt>Цель</dt><dd>{monthly.target}</dd></div><div><dt>Факт</dt><dd>{monthly.actual}</dd></div><div><dt>Осталось</dt><dd>{monthly.remaining}</dd></div></dl>
            </article>
          </section>
        </div>

        <aside className="command-right-rail" data-right-action-rail data-copilot-rail data-as6-diagnostic-copilot="right-action-rail">
          <article className="command-card copilot-hero" data-copilot-hero>
            <div className="copilot-top"><h2>AI Copilot</h2><span>AS6</span></div>
            <div className="copilot-inline-layout">
              <img className="as6-copilot-inline-logo" src={as6CopilotLogo} alt="AS6 Copilot" />
              <a className="copilot-action-link" href="/ai-executive-brain">Спросить AI Copilot</a>
            </div>
          </article>
          <article className="command-card event-card"><div className="command-card-head"><h2>Последние события</h2><a href="/dashboard">Все</a></div>{events.map((event) => <div className="event-row" key={event.text}><b>{event.icon}</b><span>{event.text}</span><time>{event.time}</time></div>)}</article>
          <article className="command-card next-action-card"><h2>Следующее лучшее действие</h2>{nextActions.map((action) => <div className="next-action" key={action.label}><b>{action.icon}</b><span>{action.label}<small>{action.note}</small></span><strong>{action.value}</strong></div>)}<div className="expected-effect"><span>Ожидаемый эффект</span><strong>+$8,900</strong></div></article>
        </aside>
      </section>



      <section className="command-recommendations" data-ai-recommendations>
        <h2>AI рекомендации</h2><div>{recommendations.map((card) => <a className={`recommendation ${card.tone}`} href={card.href} key={card.title} aria-label={card.action}><b>{card.icon}</b><strong>{card.title}</strong><p>{card.text}</p><span className="recommendation-action">{card.action} →</span></a>)}</div>
      </section>
    </main>
  )
}
