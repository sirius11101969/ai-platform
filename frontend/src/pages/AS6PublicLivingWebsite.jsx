import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createPlanCheckout, fetchCurrentWorkspace, fetchPublicPlans, notifyWorkspaceUpdated } from "../services/api";
import "./AS6PublicLivingWebsite.css";
import AS6PublicBrandHomeV1 from "./AS6PublicBrandHomeV1.jsx";

const spaces = [
  { id: "focus", name: "Фокус", role: "Пространство концентрации", description: "Собирает главное и показывает следующий лучший шаг." },
  { id: "crm", name: "CRM", role: "Пространство отношений", description: "Связывает клиентов, историю общения и возможности роста." },
  { id: "finance", name: "Финансы", role: "Пространство устойчивости", description: "Объясняет денежные потоки, риски и сценарии развития." },
  { id: "documents", name: "Документы", role: "Пространство знаний", description: "Превращает документы в понятный бизнес-контекст." },
];

export const livingBlogPosts = [
  {
    slug: "living-space-business-interface",
    category: "Живое пространство",
    date: "12 июля 2026",
    title: "Почему бизнесу больше не нужны десятки разрозненных экранов",
    excerpt: "AS6 объединяет задачи, отношения, финансы и знания в одном непрерывном интеллектуальном пространстве.",
    body: [
      "Обычные бизнес-системы заставляют человека искать нужный раздел, открывать таблицы и вручную собирать контекст.",
      "AS6 меняет саму модель взаимодействия: пользователь формулирует намерение, а пространство перестраивается вокруг текущей задачи, сохраняя связи и историю.",
      "Так интерфейс становится не набором страниц, а спокойным рабочим окружением, которое думает вместе с человеком.",
    ],
  },
  {
    slug: "human-first-ai-governance",
    category: "Управление ИИ",
    date: "10 июля 2026",
    title: "ИИ рекомендует, человек принимает решение",
    excerpt: "Как AS6 сочетает автоматизацию, объяснимость и контроль владельца бизнеса.",
    body: [
      "Автоматизация полезна только тогда, когда её действия понятны, ограничены и обратимы.",
      "В AS6 каждая рекомендация содержит причину, используемый контекст, уровень уверенности и предлагаемый следующий шаг.",
      "Права ИИ никогда не превышают права пользователя, от имени которого он работает.",
    ],
  },
  {
    slug: "knowledge-connected-business",
    category: "Знания",
    date: "8 июля 2026",
    title: "Когда документы, клиенты и финансы становятся единым знанием",
    excerpt: "Почему общий контекст важнее набора отдельных модулей и интеграций.",
    body: [
      "Клиент существует одновременно в переписке, договорах, платежах, проектах и решениях команды.",
      "Ядро знаний AS6 соединяет эти сведения и позволяет каждому пространству видеть одну согласованную картину.",
      "В результате пользователь получает не список записей, а объяснение ситуации и понятный путь к результату.",
    ],
  },
];

function LivingMark({ small = false }) {
  return <span className={small ? "living-mark living-mark--small" : "living-mark"} aria-hidden="true"><i /><i /><i /></span>;
}

function PublicHeader({ isAuthenticated = false }) {
  return (
    <header className="living-public-header">
      <Link to="/" className="living-public-brand"><LivingMark small /><span><strong>AS6</strong><small>Спокойный бизнес</small></span></Link>
      <nav aria-label="Основная навигация">
        <a href="/#spaces">Пространства</a>
        <Link to="/blog">Блог</Link>
        <Link to="/pricing">Тарифы</Link>
        <Link to="/about">О продукте</Link>
        <Link to="/contact">Контакты</Link>
      </nav>
      <div className="living-public-actions">
        <Link to="/preview/living">Посмотреть AS6</Link>
        <Link className="living-public-action" to={isAuthenticated ? "/app" : "/signup"}>{isAuthenticated ? "Открыть пространство" : "Начать работу"}</Link>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="living-public-footer">
      <Link to="/" className="living-public-brand"><LivingMark small /><span><strong>AS6</strong><small>Единое интеллектуальное пространство бизнеса</small></span></Link>
      <nav><Link to="/blog">Блог</Link><Link to="/docs">Документы</Link><Link to="/about">О продукте</Link><Link to="/contact">Контакты</Link></nav>
      <small>© 2026 AS6</small>
    </footer>
  );
}

function KnowledgeSphere() {
  return (
    <div className="living-hero-visual" aria-label="Живое пространство AS6">
      <div className="living-orbit living-orbit--one" />
      <div className="living-orbit living-orbit--two" />
      <div className="living-core"><span>AS6</span><small>понимает контекст</small></div>
      {spaces.map((space, index) => <span key={space.id} className={`living-node living-node--${index + 1}`}>{space.name}</span>)}
    </div>
  );
}

function BlogPreview() {
  return (
    <div className="living-article-list">
      {livingBlogPosts.map((post, index) => (
        <Link to={`/blog/${post.slug}`} className="living-article-link" key={post.slug}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div><small>{post.category} · {post.date}</small><h3>{post.title}</h3><p>{post.excerpt}</p></div>
          <b>Читать →</b>
        </Link>
      ))}
    </div>
  );
}

export function AS6PublicLivingHomePage({ isAuthenticated = false }) {
  return <AS6PublicBrandHomeV1 isAuthenticated={isAuthenticated} />;
}

export function AS6PublicLivingBlogPage() {
  const slug = decodeURIComponent(window.location.pathname.split("/").filter(Boolean).pop() || "");
  const post = slug ? livingBlogPosts.find((item) => item.slug === slug) : null;
  return (
    <div className="living-public-site">
      <PublicHeader />
      <main className="living-public-page">
        {post ? (
          <article className="living-blog-post"><Link to="/blog">← Все статьи</Link><span className="living-eyebrow">{post.category} · {post.date}</span><h1>{post.title}</h1><p className="living-blog-lead">{post.excerpt}</p>{post.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="living-blog-conclusion"><LivingMark small /><strong>Главная мысль</strong><p>Технология должна уменьшать сложность бизнеса, а не переносить её в новый интерфейс.</p></div></article>
        ) : (
          <section><div className="living-page-heading"><span className="living-eyebrow">Блог AS6</span><h1>Мысли о спокойном, понятном и интеллектуальном бизнесе.</h1><p>Практические материалы о живом пространстве, знаниях, автоматизации и роли человека в работе с ИИ.</p></div><BlogPreview /></section>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}

const info = {
  docs: ["Документы", "Архитектура и практические руководства AS6.", "Здесь появятся руководства по живому пространству, сценариям работы и интеграциям."],
  pricing: ["Тарифы", "Начните с ясности, масштабируйте по мере роста.", "Тарифная модель будет опубликована после завершения закрытого предварительного просмотра."],
  about: ["О продукте", "AS6 помогает человеку видеть бизнес целиком.", "Мы создаём единое интеллектуальное пространство, которое связывает знания, объясняет ситуацию и сохраняет право окончательного решения за человеком."],
  contact: ["Контакты", "Обсудим ваш бизнес и задачи.", "Свяжитесь с командой AS6 для демонстрации продукта, партнёрства или внедрения."],
};

export function AS6PublicLivingInfoPage({ type }) {
  const [title, heading, copy] = info[type] || info.about;
  return <div className="living-public-site"><PublicHeader /><main className="living-public-page"><section className="living-page-heading"><span className="living-eyebrow">{title}</span><h1>{heading}</h1><p>{copy}</p><div className="living-public-hero__actions"><Link className="living-primary" to="/preview/living">Посмотреть AS6</Link><Link className="living-secondary" to="/contact">Связаться</Link></div></section></main><PublicFooter /></div>;
}

function formatPrice(value) {
  if (value === null || value === undefined) return 'По запросу'
  if (Number(value) === 0) return 'Бесплатно'
  return `${new Intl.NumberFormat('ru-RU').format(Number(value))} ₽`
}

function planFeatures(plan) {
  const limits = plan.limits || {}
  return [
    `${new Intl.NumberFormat('ru-RU').format(limits.monthlyAiCredits || 0)} AI-кредитов`,
    `${new Intl.NumberFormat('ru-RU').format(limits.leadsLimit || 0)} клиентов в CRM`,
    `${limits.teamMembersLimit || 1} ${limits.teamMembersLimit === 1 ? 'участник' : 'участников'}`,
    `${limits.workspacesLimit || 1} ${limits.workspacesLimit === 1 ? 'пространство' : 'пространства'}`,
    limits.telegramAutomation ? 'Telegram-автоматизация' : 'Базовая работа без автоматизации',
  ]
}

export function AS6PublicLivingPricingPage({ isAuthenticated = false }) {
  const [plans, setPlans] = useState([])
  const [billing, setBilling] = useState(null)
  const [checkout, setCheckout] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [loadingPlan, setLoadingPlan] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const selectedPlan = useMemo(() => new URLSearchParams(window.location.search).get('plan') || '', [])

  useEffect(() => {
    let cancelled = false
    fetchPublicPlans().then((catalog) => {
      if (cancelled) return
      setPlans(catalog?.plans || [])
      setBilling(catalog?.billing || null)
      setCheckout(catalog?.checkout || null)
    }).catch((requestError) => {
      if (!cancelled) setError(requestError?.message || 'Не удалось загрузить тарифы')
    })

    if (isAuthenticated) {
      fetchCurrentWorkspace().then((current) => {
        if (!cancelled) setWorkspace(current?.workspace || current || null)
      }).catch((requestError) => {
        if (!cancelled) setError(requestError?.message || 'Не удалось определить текущее пространство')
      })
    }
    return () => { cancelled = true }
  }, [isAuthenticated])

  const currentRank = plans.find((plan) => plan.key === (workspace?.plan || 'free'))?.rank ?? 0

  async function choosePlan(plan) {
    setError('')
    setSuccess('')
    if (plan.key === 'enterprise') {
      window.location.assign('/contact')
      return
    }
    if (plan.key === 'free') {
      window.location.assign(isAuthenticated ? '/app' : '/signup')
      return
    }
    if (!isAuthenticated) {
      const destination = `/pricing?plan=${encodeURIComponent(plan.key)}`
      window.location.assign(`/login?next=${encodeURIComponent(destination)}`)
      return
    }
    if (workspace?.role !== 'owner') {
      setError('Повысить тариф может только владелец выбранного рабочего пространства.')
      return
    }

    try {
      setLoadingPlan(plan.key)
      const checkoutResult = await createPlanCheckout(plan.key, workspace.id)
      if (checkoutResult?.simulated && checkoutResult?.status === 'paid') {
        const current = await fetchCurrentWorkspace()
        setWorkspace(current?.workspace || current || { ...workspace, plan: plan.key })
        notifyWorkspaceUpdated({ workspaceId: workspace.id, plan: plan.key, reason: 'plan-activated' })
        setSuccess(`Тестовая активация завершена: тариф «${plan.name}» применён только в staging. Деньги не списывались.`)
        setLoadingPlan('')
        return
      }
      if (!checkoutResult?.confirmationUrl) throw new Error('Платёжная страница временно недоступна. Попробуйте немного позже.')
      window.location.assign(checkoutResult.confirmationUrl)
    } catch (checkoutError) {
      setError(checkoutError?.message || 'Не удалось перейти к оплате')
      setLoadingPlan('')
    }
  }

  return (
    <div className="living-public-site">
      <PublicHeader isAuthenticated={isAuthenticated} />
      <main className="living-pricing-page">
        <section className="living-pricing-heading">
          <span className="living-eyebrow">Тарифы AS6</span>
          <h1>Одно пространство для бизнеса любого масштаба.</h1>
          <p>Начните бесплатно и повышайте тариф, когда потребуется больше компаний, участников, клиентов и действий AS6.</p>
          {workspace && <div className="living-current-plan">Текущее пространство: <strong>{workspace.name}</strong> · тариф <strong>{plans.find((plan) => plan.key === workspace.plan)?.name || workspace.plan}</strong></div>}
          {checkout?.simulationOnly && <div className="living-pricing-simulation" role="status"><strong>Тестовый режим staging</strong><span>Тариф активируется только в тестовой базе. ЮKassa не вызывается, деньги не списываются.</span></div>}
          {success && <div className="living-pricing-success" role="status">{success}</div>}
          {error && <div className="living-pricing-error" role="alert">{error}</div>}
        </section>

        <section className="living-pricing-grid" aria-label="Тарифные планы">
          {plans.map((plan) => {
            const isCurrent = workspace?.plan === plan.key
            const unavailableDowngrade = isAuthenticated && plan.rank < currentRank
            const disabled = Boolean(loadingPlan) || isCurrent || unavailableDowngrade
            return (
              <article key={plan.key} className={`living-price-card${plan.featured ? ' living-price-card--featured' : ''}${selectedPlan === plan.key ? ' living-price-card--selected' : ''}`}>
                {plan.featured && <span className="living-price-badge">Оптимальный выбор</span>}
                <div className="living-price-card__head">
                  <span>{plan.name}</span>
                  <h2>{formatPrice(plan.price)}</h2>
                  {plan.price > 0 && <small>разовая активация</small>}
                </div>
                <p>{plan.description}</p>
                <ul>{planFeatures(plan).map((feature) => <li key={feature}>✓ <span>{feature}</span></li>)}</ul>
                <button type="button" disabled={disabled} onClick={() => choosePlan(plan)}>
                  {loadingPlan === plan.key
                    ? checkout?.simulationOnly ? 'Тестово активируем…' : 'Открываем оплату…'
                    : isCurrent ? 'Текущий тариф'
                      : unavailableDowngrade ? 'Уже включено'
                        : plan.key === 'enterprise' ? 'Обсудить внедрение'
                          : plan.key === 'free' ? 'Начать бесплатно'
                            : checkout?.simulationOnly ? 'Тестово активировать' : 'Выбрать тариф'}
                </button>
              </article>
            )
          })}
        </section>

        <section className="living-pricing-note">
          <strong>Прозрачная активация</strong>
          <p>{billing?.notice || 'После подтверждения оплаты тариф и лимиты рабочего пространства обновятся автоматически.'} Списание без отдельного решения владельца не выполняется.</p>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
