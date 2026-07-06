import as6Logo from '../assets/as6-logo.webp'
import as6Robot from '../assets/as6-robot.png'
import './AS6OnePage.css'

const nav = ['Главная','AS6 Генеральный директор','AI Действия','CRM','Клиенты','Финансы','Маркетинг','Сотрудники','Производство','Документы','Аналитика','Автоматизация','Интеграции','Настройки']
const navIcons = ['▦','⚙','⌘','▽','♚','✈','◌','♧','▤','▣','☷','⚙','☷','☼']
const kpis = [
  ['Выручка сегодня','1 248 890 ₽','↑ 18.6%','$','cyan'],['Новые лиды','247','↑ 32%','♟','pink'],['Сделки в работе','87','↑ 14%','▣','orange'],['AI сотрудники','28 / 28','Активны','◉','green'],['Конверсия','18.6%','↑ 4.2%','◎','cyan'],['Revenue at Risk','312 000 ₽','↑ 8.7%','△','red']
]
const actions = [['♧','Создать лид'],['$','Создать сделку'],['▣','Добавить задачу'],['✈','Запустить follow-up'],['#','Запустить скоринг'],['♢','Открыть Revenue Brain'],['⌂','Настроить AI']]
const cols = [
  ['Новый','12 сделок • 90 000 ₽','ООО Альфа','45 000 ₽','ООО Бета','45 000 ₽','cyan'],
  ['Квалификация','8 сделок • 320 000 ₽','ООО Гамма','90 000 ₽','ООО Дельта','230 000 ₽','pink'],
  ['Предложение','7 сделок • 680 000 ₽','ООО Эпсилон','180 000 ₽','ООО Жета','500 000 ₽','orange'],
  ['Встреча','5 сделок • 910 000 ₽','ООО Зета','200 000 ₽','ООО Ита','710 000 ₽','blue'],
  ['Успешно','6 сделок • 1 250 000 ₽','ООО Каппа','250 000 ₽','ООО Лямбда','1 000 000 ₽','green'],
]
const timeline = ['AS6 завершил анализ выручки','Создан follow-up для 8 лидов','Найден риск по сделке','Обнаружен горячий лид','AS6 рекомендует действие']
const status = ['AI работает','CRM синхронизирована','Почта подключена','Telegram подключён','WhatsApp подключён','Все системы онлайн']

function Spark({tone='cyan'}) { return <svg className={`one-spark ${tone}`} viewBox="0 0 120 45" preserveAspectRatio="none"><polyline points="0,36 10,34 20,35 31,32 41,31 51,24 61,28 71,18 81,24 91,13 101,18 111,8 120,2" /></svg> }
function Avatar(){ return <div className="one-avatar"><span>👨🏻</span></div> }

export default function AS6OnePage(){
  return <div className="as6-one-page">
    <aside className="one-sidebar">
      <div className="one-logo"><img src={as6Logo} alt="AS6 ONE"/><b>ONE</b></div><p>Центр управления компанией</p>
      <nav>{nav.map((n,i)=><a key={n} href={n === 'CRM' ? '/as6-crm' : undefined} className={i===0?'active':''}><span>{navIcons[i]}</span>{n}</a>)}</nav>
      <div className="one-owner"><Avatar/><div><b>Владимир</b><span>Владелец, AS6</span><em>● Онлайн</em></div></div>
      <div className="one-core"><b>AS6 CORE</b><span>Ядро системы активно</span><img src={as6Robot} alt="AS6 Core"/></div>
    </aside>
    <main className="one-main">
      <header className="one-header">
        <div className="one-title"><h1>AS6 ONE</h1><p>Первая цифровая форма жизни для бизнеса ⓘ</p></div>
        <label className="one-search"><span>⌕</span><input placeholder="Что нужно сделать?"/><kbd>Ctrl + K</kbd><button>→</button></label>
        <div className="one-switch"><b>RU</b><span>EN</span></div><div className="one-select"><small>Рабочее пространство</small><b>AS6 Workspace⌄</b></div><div className="one-select"><small>Команда и тариф</small><b>Enterprise · PRO</b></div><div className="one-profile"><Avatar/><b>Владимир</b><span>Владелец</span><i>⌄</i></div>
      </header>
      <div className="one-layout">
        <section className="one-content">
          <section className="one-hero"><div className="brain"><img src={as6Robot} alt="AI"/></div><div className="hero-copy"><h2>AS6 Генеральный директор</h2><p>Ваш цифровой руководитель</p><div className="hero-actions"><button>✉ Закрыть 4 сделки <small>на сумму 487 000 ₽</small></button><button>✉ Ответить 12 клиентам <small>с высоким приоритетом</small></button><button>⌁ Перезапустить 3 сделки <small>зависшие более 7 дней</small></button><button>▣ Назначить встречу <small>с ООО «Альфа»</small></button></div></div><div className="forecast"><span>Прогноз роста выручки</span><b>+487 000 ₽</b><small>к плану месяца</small><Spark/><button>▷ Выполнить план AS6</button></div></section>
          <section className="one-kpis">{kpis.map(k=><article className={`one-kpi ${k[4]}`} key={k[0]}><span>{k[0]}</span><b>{k[1]}</b><em>{k[2]}</em><i>{k[3]}</i><Spark tone={k[4]}/></article>)}</section>
          <section className="one-action-center"><h3>Центр действий AS6</h3><div>{actions.map(a=><button key={a[1]}><span>{a[0]}</span>{a[1]}</button>)}</div></section>
          <section className="revenue-brain"><h3>REVENUE BRAIN</h3><div className="rb-logo"><img src={as6Robot}/></div><div><span>Прогноз (7 дней)</span><b>1 845 000 ₽</b><em>↑ 18%</em><label>До выполнения плана <i>91%</i></label><progress value="91" max="100"/><label>Вероятность выполнения плана <i>96%</i></label></div><div><span>Горячие лиды</span><b>18</b><p className="faces">👨🏻 👨🏻 👨🏻 👨🏻</p><em>+12 новых</em></div><div><span>Риск-сделки</span><b>8</b><p className="faces">👨🏻 👨🏻 👨🏻 👨🏻</p><strong>Требуют внимания</strong></div><div><span>AI-оценка (ср.)</span><b>76 <small>/100</small></b><em>↑ 6%</em><Spark tone="pink"/></div><div className="ring"><b>92%</b><span>Отлично</span></div><div className="next"><span>Следующее лучшее действие</span><b>Позвонить компании Альфа</b><small>Высокая вероятность закрытия</small><em>+87 000 ₽</em><button>Выполнить</button></div></section>
          <section className="one-pipeline"><h3>CRM-ВОРОНКА</h3><div className="pipe-grid">{cols.map(c=><div className={`pipe-col ${c[6]}`} key={c[0]}><h4>{c[0]}</h4><p>{c[1]}</p>{[0,1].map(i=><article key={i}><b>{c[2+i*2]}</b><strong>{c[3+i*2]}</strong><span>AI {81-i*7} • Высокий • {i?'40%':'10%'}</span><small>17 мая &nbsp;&nbsp;&nbsp;⌕ ✉ ▣</small></article>)}<button>+ Добавить сделку</button></div>)}</div></section>
        </section>
        <aside className="one-rail"><div className="rail-icons"><button>⌕</button><button>♧<em>12</em></button><button>▱<em>3</em></button><button>?</button><button>AS6 Core ⌁</button></div><article className="ask"><b>AS6 ПОМОЩНИК</b><h3>Спросить AS6</h3><p>Аналитика, рекомендации, следующие действия</p><button>Спросить AS6</button></article><article><h3>Рекомендация AS6 <i>П1</i></h3><p>Сфокусируйтесь на 8 горячих лидах — вероятность сделки выше на 38%.</p><button>Показать лиды</button></article><article><h3>AI Timeline</h3>{timeline.map((t,i)=><p className="rail-row" key={t}><b>{17+i}:{21+i}</b>{t}<span>{2+i*5} мин назад</span></p>)}</article><article><h3>Состояние системы</h3>{status.map(s=><p className="status" key={s}>◎ {s}<b>Онлайн</b></p>)}</article></aside>
      </div>
    </main><footer className="one-footer">△ AI работает ● &nbsp;&nbsp; ♧ CRM синхронизирована ● &nbsp;&nbsp; ✉ Почта подключена ● &nbsp;&nbsp; ✈ Telegram подключён ● &nbsp;&nbsp; ☎ WhatsApp подключён ● <span>Обновлено: 17:45:21</span></footer>
  </div>
}
