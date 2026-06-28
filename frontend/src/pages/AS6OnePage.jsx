import as6CopilotLogo from '../assets/as6-copilot-asset.png'
import as6Robot from '../assets/as6-robot.png'
import { BellIcon, ChatIcon, HelpIcon } from '../components/icons/TopbarIcons.jsx'

const dictionaries = {
  ru: {
    title: 'AS6 ONE', subtitle: 'Первая цифровая форма жизни для бизнеса', commandPlaceholder: 'Что нужно сделать?', hotkeys: 'Горячие клавиши', quick: 'Быстрые действия', workspace: 'AS6 Workspace', profile: 'Владимир', recommends: 'Сегодня AS6 рекомендует', aiDirector: 'AS6 Генеральный директор', plan: 'Закрыть 4 сделки, ответить 12 клиентам и перезапустить 3 зависшие сделки.', growth: 'Прогноз роста выручки', execute: 'Выполнить план AS6', kpi: ['Выручка', 'Лиды', 'Сделки', 'Конверсия', 'AS6 Сотрудники', 'Риск', 'Прогноз'], actionsTitle: 'Центр действий AS6', actions: ['Создать лид', 'Создать сделку', 'Позвонить', 'Запустить автоматизацию', 'Открыть Revenue Brain', 'Настроить систему'], brain: 'Revenue Brain', forecast: 'Прогноз', aiScore: 'AI-оценка', funnelHealth: 'Здоровье воронки', nextBest: 'Лучшее следующее действие', risk: 'Риск', hotLeads: 'Горячие лиды', pipeline: 'CRM Pipeline', stages: ['Новый', 'Квалификация', 'Предложение', 'Встреча', 'Успешно'], assistant: 'AS6 Помощник', ask: 'Спросить AS6', recs: 'Рекомендации', timeline: 'Timeline', system: 'Состояние системы', online: 'Онлайн', footer: ['Все сервисы онлайн', 'CRM синхронизирована', 'Telegram подключён', 'AI работает', 'Почта подключена'] },
  en: {
    title: 'AS6 ONE', subtitle: 'The first digital life form for business', commandPlaceholder: 'What needs to be done?', hotkeys: 'Hotkeys', quick: 'Quick actions', workspace: 'AS6 Workspace', profile: 'Vladimir', recommends: 'Today AS6 recommends', aiDirector: 'AS6 Chief Executive', plan: 'Close 4 deals, answer 12 customers, and restart 3 stalled deals.', growth: 'Revenue growth forecast', execute: 'Execute AS6 plan', kpi: ['Revenue', 'Leads', 'Deals', 'Conversion', 'AS6 Employees', 'Risk', 'Forecast'], actionsTitle: 'AS6 Action Center', actions: ['Create lead', 'Create deal', 'Call', 'Launch automation', 'Open Revenue Brain', 'Configure system'], brain: 'Revenue Brain', forecast: 'Forecast', aiScore: 'AI score', funnelHealth: 'Pipeline health', nextBest: 'Next best action', risk: 'Risk', hotLeads: 'Hot leads', pipeline: 'CRM Pipeline', stages: ['New', 'Qualification', 'Proposal', 'Meeting', 'Won'], assistant: 'AS6 Assistant', ask: 'Ask AS6', recs: 'Recommendations', timeline: 'Timeline', system: 'System status', online: 'Online', footer: ['All services online', 'CRM synchronized', 'Telegram connected', 'AI running', 'Mail connected'] },
}

const lang = 'ru'
const t = dictionaries[lang]
const kpiValues = ['1 248 890 ₽', '247', '87', '18.6%', '28 / 28', '312 000 ₽', '+487 000 ₽']
const tones = ['revenue', 'leads', 'deals', 'conversion', 'ai', 'risk', 'revenue']
const sparks = [[18,20,24,31,42,48,58],[16,22,34,31,42,50,58],[45,36,40,48,52,59,62],[21,26,24,31,35,39,46],[52,50,54,53,55,56,58],[20,25,29,38,45,50,61],[16,25,33,45,51,58,64]]
const deals = ['ООО Альфа', 'ООО Бета', 'ООО Гамма', 'ООО Дельта', 'ООО Эпсилон', 'ООО Жета', 'ООО Зета', 'ООО Ига', 'ООО Каппа', 'ООО Лямбда']

function sparklinePoints(values) { return values.map((value, index) => `${index * (100 / (values.length - 1))},${64 - value}`).join(' ') }

export default function AS6OnePage() {
  return <main className="command-center-page as6-one-page" data-command-center-visual="premium-as6" data-as6-diagnostic-page="as6-one-preview">
    <section className="command-hero" data-as6-diagnostic-hero="as6-one-command-bar">
      <div><h1>{t.title}</h1><p>{t.subtitle}</p></div>
      <div className="command-top-actions" aria-label="AS6 ONE command bar">
        <label className="command-search"><span>⌕</span><input type="search" placeholder={t.commandPlaceholder} /></label>
        <a className="top-icon" href="#ru" aria-label="RU">RU</a><a className="top-icon" href="#en" aria-label="EN">EN</a>
        <a className="top-icon" href="/as6-one" aria-label={t.workspace}>{t.workspace}</a>
        <a href="/followups" className="top-icon" data-badge="12" aria-label="Notifications"><BellIcon /></a><a href="/priority-inbox" className="top-icon" data-badge="3" aria-label="Messages"><ChatIcon /></a><a href="/ai-system-health-center" className="top-icon" aria-label="Help"><HelpIcon /></a><a href="/profile" className="command-avatar top-icon-profile" aria-label="Profile">В</a>
      </div>
    </section>

    <section className="command-card daily-goal">
      <div className="command-card-head"><h2>{t.recommends}</h2><span>{t.growth}</span></div>
      <div className="pipeline-layout"><div><h2>{t.aiDirector}</h2><p>{t.plan}</p><div className="command-live-status"><a href="/crm">Закрыть 4 сделки</a><a href="/priority-inbox">Ответить 12 клиентам</a><a href="/followups">Назначить встречу</a></div></div><div className="pipeline-summary"><small>{t.growth}</small><strong>+487 000 ₽</strong><a className="copilot-action-link" href="/ai-execution-center">▷ {t.execute}</a></div></div>
    </section>

    <section className="command-kpis" data-command-kpi-row>{t.kpi.map((label, index) => <article className={`command-kpi ${tones[index]}`} key={label}><div className="kpi-copy"><span>{label}</span><strong>{kpiValues[index]}</strong><em>{index === 5 ? '↑ 8.7%' : index === 6 ? 'к плану месяца' : '↑ 18.6%'}</em></div><svg className="kpi-spark" viewBox="0 0 100 64" preserveAspectRatio="none"><polyline points={sparklinePoints(sparks[index])} /></svg><i>{index === 4 ? <img src={as6Robot} alt="AS6" className="as6-ai-kpi-robot-image" /> : '◎'}</i></article>)}</section>

    <section className="quick-actions quick-actions-primary"><h2>{t.actionsTitle}</h2><div>{t.actions.map((action) => <a href="/crm" role="button" key={action}><span>✦</span>{action}</a>)}</div></section>

    <section className="command-main-grid"><div className="command-core">
      <section className="command-card revenue-dynamics"><div className="command-card-head"><h2>{t.brain}</h2><a className="copilot-action-link" href="/ai-revenue-intelligence">Открыть Revenue Brain</a></div><div className="goal-stats"><div><small>{t.forecast}</small><strong>1 845 000 ₽</strong></div><div><small>{t.hotLeads}</small><strong>18</strong></div><div><small>{t.risk}</small><strong>8</strong></div><div><small>{t.aiScore}</small><strong>76 /100</strong></div><div><small>{t.funnelHealth}</small><strong>92%</strong></div><div><small>{t.nextBest}</small><strong>Позвонить Альфа</strong></div></div><div className="mock-chart"><span style={{height:'46%'}}/><span style={{height:'64%'}}/><span style={{height:'78%'}}/><span style={{height:'92%'}}/><svg viewBox="0 0 240 100" preserveAspectRatio="none"><polyline points="0,76 34,58 68,66 102,38 136,52 170,24 204,36 240,12" /></svg></div></section>
      <section className="command-card pipeline-card"><div className="command-card-head"><h2>{t.pipeline}</h2><a href="/crm">+ Добавить сделку</a></div><div className="command-recommendations"><div>{t.stages.map((stage, stageIndex) => <article className="recommendation" key={stage}><strong>{stage}</strong>{deals.slice(stageIndex*2, stageIndex*2+2).map((deal, dealIndex) => <p key={deal}>{deal} · AI {71 + stageIndex * 5 + dealIndex} · {(45 + stageIndex * 90 + dealIndex * 140).toLocaleString('ru-RU')} 000 ₽</p>)}</article>)}</div></div></section>
    </div><aside className="command-right-rail" data-right-action-rail><article className="command-card copilot-hero"><div className="copilot-top"><h2>{t.assistant}</h2><span>AS6</span></div><div className="copilot-inline-layout"><img className="as6-copilot-inline-logo" src={as6CopilotLogo} alt="AS6 Assistant"/><a className="copilot-action-link" href="/ai-executive-brain">{t.ask}</a></div></article><article className="command-card next-action-card"><h2>{t.recs}</h2><div className="next-action"><b>P1</b><span>Сфокусируйтесь на 8 горячих лидах<small>Вероятность сделки выше на 38%</small></span><strong>+38%</strong></div></article><article className="command-card event-card"><div className="command-card-head"><h2>AI {t.timeline}</h2><a href="/dashboard">Все</a></div>{['AS6 завершил анализ выручки','Создан follow-up для 8 лидов','Найден риск по сделке','AS6 рекомендует действие'].map((e,i)=><div className="event-row" key={e}><b>✦</b><span>{e}</span><time>{17+i}:2{i}</time></div>)}</article><article className="command-card event-card"><h2>{t.system}</h2>{['AI работает','CRM синхронизирована','Почта подключена','Telegram подключён','Все системы онлайн'].map((e)=><div className="event-row" key={e}><b>●</b><span>{e}</span><time>{t.online}</time></div>)}</article></aside></section>
    <section className="quick-actions quick-actions-primary" aria-label="AS6 status line"><div>{t.footer.map((item)=><a href="/ai-system-health-center" key={item}><span>●</span>{item}</a>)}</div></section>
  </main>
}
