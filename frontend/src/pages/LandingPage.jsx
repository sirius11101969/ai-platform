import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { submitPublicLead } from "../services/api";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.7, ease: "easeOut" },
};

const agents = [
  {
    icon: "✦",
    title: "AI SDR",
    copy: "Квалифицирует лиды, задаёт уточняющие вопросы и передаёт горячие сделки в CRM.",
  },
  {
    icon: "◈",
    title: "AI‑поддержка",
    copy: "Отвечает клиентам 24/7, резюмирует диалоги и подсказывает следующий лучший шаг.",
  },
  {
    icon: "✺",
    title: "AI‑маркетолог",
    copy: "Генерирует офферы, сегменты, контент и Telegram‑сценарии под вашу воронку.",
  },
];

const pricing = [
  { name: "Старт", price: "3 900 ₽", detail: "60 AI‑кредитов", features: ["1 AI‑агент", "Telegram‑воронка", "Базовая CRM"], accent: "violet" },
  { name: "Профи", price: "9 900 ₽", detail: "180 AI‑кредитов", features: ["3 AI‑агента", "CRM‑автоматизация", "Приоритетные сценарии"], accent: "cyan", featured: true },
  { name: "Бизнес", price: "24 900 ₽", detail: "450 AI‑кредитов", features: ["Командная CRM", "Дашборды выручки", "Внедрение для команд"], accent: "pink" },
];

const metrics = [
  ["-42%", "ручной рутины"],
  ["24/7", "работа AI‑агентов"],
  ["x3.2", "ускорение обработки лидов"],
  ["99%", "готовность к масштабированию"],
];

const initialLeadForm = {
  name: "",
  email: "",
  phone: "",
  telegram: "",
  company: "",
  message: "",
  website: "",
};

function getLandingTracking(source) {
  if (typeof window === "undefined") {
    return { source, page_url: "", utm_source: "", utm_medium: "", utm_campaign: "" };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    source,
    page_url: window.location.href,
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
  };
}

function LeadCaptureForm({ source = "landing_cta", compact = false }) {
  const [form, setForm] = useState(initialLeadForm);
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");
    try {
      await submitPublicLead({ ...form, ...getLandingTracking(source) });
      setStatus("success");
      setFeedback("Заявка отправлена. Мы скоро свяжемся с вами.");
      setForm(initialLeadForm);
    } catch (_error) {
      setStatus("error");
      setFeedback("Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  }

  return (
    <form className={`lead-capture-form shell-glow ${compact ? "compact" : ""}`} onSubmit={handleSubmit}>
      <div className="lead-form-heading">
        <span className="eyebrow">CRM lead capture</span>
        <h3>Получить демо AS6 AI CRM</h3>
        <p>Оставьте контакт — AI SDR создаст лида в CRM и подготовит рекомендацию для менеджера.</p>
      </div>
      <div className="lead-form-grid">
        <label>
          <span>Имя</span>
          <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Ваше имя" autoComplete="name" required />
        </label>
        <label>
          <span>Email *</span>
          <input value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="you@company.com" type="email" autoComplete="email" required />
        </label>
        <label>
          <span>Телефон</span>
          <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="+7..." autoComplete="tel" />
        </label>
        <label>
          <span>Telegram</span>
          <input value={form.telegram} onChange={(event) => updateField("telegram", event.target.value)} placeholder="@username" />
        </label>
        <label className="span-2">
          <span>Компания</span>
          <input value={form.company} onChange={(event) => updateField("company", event.target.value)} placeholder="Название компании" autoComplete="organization" />
        </label>
        <label className="span-2">
          <span>Что хотите автоматизировать? *</span>
          <textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} placeholder="Например: заявки с сайта, Telegram, follow-ups, AI SDR" rows={compact ? 3 : 4} required />
        </label>
      </div>
      <label className="lead-form-honeypot" aria-hidden="true" tabIndex="-1">
        <span>Website</span>
        <input value={form.website} onChange={(event) => updateField("website", event.target.value)} name="website" autoComplete="off" tabIndex="-1" />
      </label>
      <button className="btn primary" type="submit" disabled={status === "sending"}>{status === "sending" ? "Отправляем…" : "Оставить заявку"}</button>
      {feedback && <p className={status === "success" ? "success-alert" : "auth-error"}>{feedback}</p>}
    </form>
  );
}

function FloatingParticles() {
  return (
    <div className="particles" aria-hidden="true">
      {Array.from({ length: 26 }).map((_, index) => (
        <span key={index} style={{ "--size": `${3 + (index % 4)}px`, "--duration": `${7 + (index % 8)}s`, left: `${(index * 37) % 100}%`, top: `${(index * 53) % 100}%` }} />
      ))}
    </div>
  );
}

function SectionHeader({ eyebrow, title, copy }) {
  return (
    <motion.div className="section-header" {...fadeUp}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{copy}</p>
    </motion.div>
  );
}

function DashboardPreview() {
  return (
    <motion.div className="dashboard shell-glow" initial={{ opacity: 0, y: 28, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9 }}>
      <div className="dashboard-top">
        <div>
          <span className="status-dot" /> AI‑центр управления
        </div>
        <strong>В эфире</strong>
      </div>
      <div className="dashboard-grid">
        <div className="glass-tile span-2">
          <div className="tile-label">Выручка воронки</div>
          <div className="tile-value">8,4 млн ₽</div>
          <div className="chart-bars">
            {[42, 66, 51, 82, 74, 92, 88].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
          </div>
        </div>
        <div className="glass-tile agent-feed">
          <div className="tile-label">Агенты онлайн</div>
          <div className="avatar-stack"><b>AI</b><b>CRM</b><b>TG</b></div>
          <p>17 лидов обработано за последний час</p>
        </div>
        <div className="glass-tile">
          <div className="tile-label">Рост конверсии</div>
          <div className="tile-value cyan">+31%</div>
          <small>после AI‑дожима</small>
        </div>
        <div className="glass-tile span-2 activity-card">
          <div className="activity-row"><span /> Новый лид из Telegram → скоринг 92</div>
          <div className="activity-row"><span /> AI SDR назначил демо на 16:30</div>
          <div className="activity-row"><span /> CRM обновила этап: Предложение отправлено</div>
        </div>
      </div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <FloatingParticles />
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <nav className="nav">
        <a href="#top" className="brand"><span>AI</span> Платформа продаж</a>
        <div className="nav-links">
          <a href="#agents">Агенты</a>
          <a href="#workflow">CRM</a>
          <a href="#pricing">Тарифы</a>
        </div>
        <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
  <a className="nav-cta" href="/login">Войти</a>
  <a className="nav-cta" href="https://t.me/" target="_blank" rel="noreferrer">Демо в Telegram</a>
</div>
      </nav>

      <div className="hero-grid">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="hero-badge">AS6 помогает понять продажи, клиентов и следующий шаг</span>
          <h1>AS6 показывает, что происходит в продажах и что делать дальше</h1>
          <p className="lead">
            Соберите заявки, CRM, AI-подсказки и выручку в одном рабочем центре. Пользователь видит ситуацию, следующий шаг и понятный план действий.
          </p>
          <div className="actions">
            <a className="btn primary" href="#lead-form">Получить демо и план</a>
            <a className="btn secondary" href="#calculator">Посчитать эффект</a>
          </div>
          <div className="hero-proof">
            <span>Понятный старт за 10 секунд</span>
            <strong>CRM и заявки</strong>
            <strong>AI подсказывает шаг</strong>
            <strong>Контроль выручки</strong>
          </div>
        </motion.div>
        <div id="lead-form" className="hero-form-stack"><LeadCaptureForm source="hero_demo" /></div>
      </div>
    </section>
  );
}

function AgentsSection() {
  return (
    <section className="section" id="agents">
      <SectionHeader eyebrow="AI‑команда" title="Агенты, которые закрывают операционные пробелы" copy="Соберите цифровую команду под продажи, поддержку, маркетинг и сопровождение клиентов — без хаоса в инструментах." />
      <div className="agent-grid">
        {agents.map((agent) => (
          <motion.article className="agent-card" key={agent.title} {...fadeUp}>
            <div className="agent-icon">{agent.icon}</div>
            <h3>{agent.title}</h3>
            <p>{agent.copy}</p>
            <div className="agent-pulse"><span /> активен</div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function WorkflowSection() {
  const steps = ["Лид получен", "AI‑скоринг", "Этап CRM", "Дожим", "Оплата"];
  return (
    <section className="section workflow-section" id="workflow">
      <SectionHeader eyebrow="CRM‑автоматизация" title="Визуальная автоматизация CRM без ручных потерь" copy="Каждый лид проходит через AI‑скоринг, постановку задач, Telegram‑дожим и обновление сделки — прозрачно для команды и руководителя." />
      <motion.div className="workflow shell-glow" {...fadeUp}>
        {steps.map((step, index) => (
          <div className="workflow-step" key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
            {index < steps.length - 1 && <i />}
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function CalculatorSection({ clients, setClients, price, setPrice, revenue }) {
  return (
    <section className="section calculator-section" id="calculator">
      <SectionHeader eyebrow="Калькулятор выручки" title="Посчитайте потенциальную подписочную выручку" copy="Сохранена существующая логика: количество клиентов умножается на средний чек подписки. Используйте её как быстрый ориентир для запуска." />
      <motion.div className="calculator-card shell-glow" {...fadeUp}>
        <label>
          <span>Клиентов в месяц</span>
          <input aria-label="Клиентов в месяц" type="number" min="0" value={clients} onChange={(event) => setClients(Number(event.target.value))} />
        </label>
        <label>
          <span>Средний чек, ₽</span>
          <input aria-label="Средний чек" type="number" min="0" value={price} onChange={(event) => setPrice(Number(event.target.value))} />
        </label>
        <div className="result-box">
          <span>Прогноз регулярной выручки</span>
          <strong>{revenue.toLocaleString("ru-RU")} ₽</strong>
          <small>в месяц при текущей модели подписки</small>
        </div>
      </motion.div>
    </section>
  );
}

function PricingSection() {
  async function startCheckout(plan) {
    try {
      const response = await fetch(`/api/public/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          plan: plan.key || plan.name,
          currency: "RUB",
          amount: Number(String(plan.price).replace(/[^0-9]/g, "")) || 10,
          customerEmail: "buylesson@gmail.com"
        })
      });

if(!response.ok){
const text=await response.text();
throw new Error(text || "Checkout unavailable");
}

      const data = await response.json();

      if (!response.ok || !data.confirmationUrl) {
        throw new Error(data.error || "Не удалось создать оплату");
      }

      const checkoutUrl = data.confirmationUrl || data.checkout_url || data.transaction?.checkout_url;

      if (!checkoutUrl) {
        throw new Error("Ссылка на оплату не получена");
      }

      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      alert(error.message || "Ошибка оплаты");
    }
  }

  return (
    <section className="section pricing-section" id="pricing">
      <SectionHeader eyebrow="Тарифы" title="Glow‑тарифы для быстрого запуска и масштабирования" copy="Начните с MVP, подключите больше AI‑кредитов и расширяйте CRM‑автоматизацию по мере роста команды." />
      <div className="pricing-grid">
        {pricing.map((plan) => (
          <motion.article className={`price-card ${plan.accent} ${plan.featured ? "featured" : ""}`} key={plan.name} {...fadeUp}>
            {plan.featured && <span className="popular">Самый популярный</span>}
            <h3>{plan.name}</h3>
            <div className="price">{plan.price}<small>/мес</small></div>
            <p>{plan.detail}</p>
            <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <button
type="button"
className="pricing-cta-btn"
onClick={() => startCheckout(plan)}
>
Выбрать тариф
</button>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="trust-section">
      <div className="metrics-grid">
        {metrics.map(([value, label]) => (
          <motion.div className="metric-card" key={label} {...fadeUp}>
            <strong>{value}</strong>
            <span>{label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="final-cta">
      <motion.div className="cta-panel shell-glow" {...fadeUp}>
        <span className="eyebrow">Готово к запуску</span>
        <h2>Соберите AI‑операционную систему продаж за дни, не месяцы</h2>
        <p>Премиальный лендинг, CRM‑ядро, Telegram‑воронки, AI‑кредиты и агенты готовы стать фундаментом нового SaaS‑направления.</p>
        <div className="actions center">
          <a className="btn primary" href="#lead-form">Получить демо и план</a>
          <a className="btn secondary" href="#pricing">Сравнить тарифы</a>
        </div>
        <LeadCaptureForm source="final_cta" compact />
      </motion.div>
    </section>
  );
}



export default function LandingPage() {
  const [clients, setClients] = useState(40);
  const [price, setPrice] = useState(3900);

  const revenue = useMemo(() => clients * price, [clients, price]);

  return (
    <main className="page">
      <Hero />
      <AgentsSection />
      <WorkflowSection />
      <CalculatorSection clients={clients} setClients={setClients} price={price} setPrice={setPrice} revenue={revenue} />
      <PricingSection />
      <TrustSection />
      <FinalCta />
      <footer className="footer">
        <span>AI‑платформа продаж © 2026</span>
        <span>AI‑CRM · AI‑агенты · Telegram‑автоматизация · AI‑кредиты</span>
      </footer>
    </main>
  );
}
