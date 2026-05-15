import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

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
    title: "AI Support",
    copy: "Отвечает клиентам 24/7, резюмирует диалоги и подсказывает следующий лучший шаг.",
  },
  {
    icon: "✺",
    title: "AI Marketer",
    copy: "Генерирует офферы, сегменты, контент и Telegram-сценарии под вашу воронку.",
  },
];

const pricing = [
  { name: "Starter", price: "3 900 ₽", detail: "60 credits", features: ["1 AI-агент", "Telegram-воронка", "Базовая CRM"], accent: "violet" },
  { name: "Pro", price: "9 900 ₽", detail: "180 credits", features: ["3 AI-агента", "CRM-автоматизация", "Приоритетные сценарии"], accent: "cyan", featured: true },
  { name: "Business", price: "24 900 ₽", detail: "450 credits", features: ["Командная CRM", "Revenue dashboards", "Enterprise onboarding"], accent: "pink" },
];

const metrics = [
  ["-42%", "ручной рутины"],
  ["24/7", "работа AI-агентов"],
  ["x3.2", "ускорение обработки лидов"],
  ["99%", "готовность к масштабированию"],
];

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
          <span className="status-dot" /> AI Command Center
        </div>
        <strong>Live</strong>
      </div>
      <div className="dashboard-grid">
        <div className="glass-tile span-2">
          <div className="tile-label">Pipeline revenue</div>
          <div className="tile-value">8.4M ₽</div>
          <div className="chart-bars">
            {[42, 66, 51, 82, 74, 92, 88].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
          </div>
        </div>
        <div className="glass-tile agent-feed">
          <div className="tile-label">Agents online</div>
          <div className="avatar-stack"><b>AI</b><b>CRM</b><b>TG</b></div>
          <p>17 лидов обработано за последний час</p>
        </div>
        <div className="glass-tile">
          <div className="tile-label">Conversion lift</div>
          <div className="tile-value cyan">+31%</div>
          <small>после AI follow-up</small>
        </div>
        <div className="glass-tile span-2 activity-card">
          <div className="activity-row"><span /> Новый lead из Telegram → скоринг 92</div>
          <div className="activity-row"><span /> AI SDR назначил демо на 16:30</div>
          <div className="activity-row"><span /> CRM обновила этап: Proposal sent</div>
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
        <a href="#top" className="brand"><span>AI</span> Bot Platform</a>
        <div className="nav-links">
          <a href="#agents">Агенты</a>
          <a href="#workflow">CRM</a>
          <a href="#pricing">Тарифы</a>
        </div>
        <a className="nav-cta" href="https://t.me/" target="_blank" rel="noreferrer">Telegram demo</a>
      </nav>

      <div className="hero-grid">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="hero-badge">Enterprise AI startup stack · CRM · Agents · Payments</span>
          <h1>AI‑платформа, которая превращает лиды в управляемую выручку</h1>
          <p className="lead">
            Запускайте AI-агентов для продаж и поддержки, автоматизируйте Telegram-воронки,
            ведите сделки в CRM и считайте экономику роста из единого премиального dashboard.
          </p>
          <div className="actions">
            <a className="btn primary" href="https://t.me/" target="_blank" rel="noreferrer">Открыть Telegram-бота</a>
            <a className="btn secondary" href="#calculator">Рассчитать выручку</a>
          </div>
          <div className="hero-proof">
            <span>Trusted AI workflows</span>
            <strong>CRM-ready</strong>
            <strong>Docker-ready</strong>
            <strong>Vite production</strong>
          </div>
        </motion.div>
        <DashboardPreview />
      </div>
    </section>
  );
}

function AgentsSection() {
  return (
    <section className="section" id="agents">
      <SectionHeader eyebrow="AI workforce" title="Агенты, которые закрывают операционные пробелы" copy="Соберите цифровую команду под продажи, поддержку, маркетинг и сопровождение клиентов — без хаоса в инструментах." />
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
  const steps = ["Lead captured", "AI scoring", "CRM stage", "Follow-up", "Payment"];
  return (
    <section className="section workflow-section" id="workflow">
      <SectionHeader eyebrow="CRM automation" title="Визуальная автоматизация CRM без ручных потерь" copy="Каждый лид проходит через AI-скоринг, постановку задач, Telegram follow-up и обновление сделки — прозрачно для команды и руководителя." />
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
      <SectionHeader eyebrow="Revenue calculator" title="Посчитайте потенциальную подписочную выручку" copy="Сохранена существующая логика: количество клиентов умножается на средний чек подписки. Используйте её как быстрый ориентир для запуска." />
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
          <span>Прогноз MRR</span>
          <strong>{revenue.toLocaleString("ru-RU")} ₽</strong>
          <small>в месяц при текущей модели подписки</small>
        </div>
      </motion.div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="section pricing-section" id="pricing">
      <SectionHeader eyebrow="Pricing" title="Glow‑тарифы для быстрого запуска и масштабирования" copy="Начните с MVP, подключите больше AI-кредитов и расширяйте CRM-автоматизацию по мере роста команды." />
      <div className="pricing-grid">
        {pricing.map((plan) => (
          <motion.article className={`price-card ${plan.accent} ${plan.featured ? "featured" : ""}`} key={plan.name} {...fadeUp}>
            {plan.featured && <span className="popular">Самый популярный</span>}
            <h3>{plan.name}</h3>
            <div className="price">{plan.price}<small>/мес</small></div>
            <p>{plan.detail}</p>
            <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <a href="https://t.me/" target="_blank" rel="noreferrer">Выбрать тариф</a>
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
        <span className="eyebrow">Ready for launch</span>
        <h2>Соберите AI‑операционную систему продаж за дни, не месяцы</h2>
        <p>Премиальный лендинг, CRM-ядро, Telegram-воронки, AI-кредиты и агенты готовы стать фундаментом нового SaaS-направления.</p>
        <div className="actions center">
          <a className="btn primary" href="https://t.me/" target="_blank" rel="noreferrer">Запустить demo</a>
          <a className="btn secondary" href="#pricing">Сравнить тарифы</a>
        </div>
      </motion.div>
    </section>
  );
}

export default function App() {
  const [clients, setClients] = useState(40);
  const [price, setPrice] = useState(3900);

  const revenue = useMemo(() => clients * price, [clients, price]);

  return (
    <main className="page">
      <style>{`
        :root {
          color-scheme: dark;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #050712;
          color: #f7fbff;
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #050712; color: #f7fbff; }
        a { color: inherit; text-decoration: none; }
        .page { min-height: 100vh; overflow: hidden; background: radial-gradient(circle at 50% 0%, rgba(91, 79, 255, .24), transparent 34%), #050712; }
        .hero { position: relative; min-height: 100vh; padding: 28px min(7vw, 108px) 96px; isolation: isolate; background: linear-gradient(135deg, rgba(9,12,28,.96), rgba(3,5,13,.98)); }
        .hero::before { content: ""; position: absolute; inset: 0; z-index: -3; background: linear-gradient(115deg, rgba(91,79,255,.22), transparent 26%, rgba(0,221,255,.16) 52%, transparent 70%, rgba(255,63,201,.14)); background-size: 240% 240%; animation: gradientShift 14s ease-in-out infinite alternate; }
        .hero::after { content: ""; position: absolute; inset: 0; z-index: -2; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 72px 72px; mask-image: linear-gradient(to bottom, rgba(0,0,0,.88), transparent 82%); }
        .aurora { position: absolute; width: 42vw; height: 42vw; border-radius: 50%; filter: blur(80px); opacity: .58; z-index: -1; animation: floatAurora 12s ease-in-out infinite alternate; }
        .aurora-one { left: -12vw; top: 7vh; background: #694fff; }
        .aurora-two { right: -14vw; top: 22vh; background: #00d8ff; animation-delay: -5s; }
        .particles { position: absolute; inset: 0; overflow: hidden; z-index: -1; pointer-events: none; }
        .particles span { position: absolute; width: var(--size); height: var(--size); border-radius: 999px; background: rgba(139, 234, 255, .82); box-shadow: 0 0 22px rgba(0, 216, 255, .85); animation: particleFloat var(--duration) ease-in-out infinite alternate; opacity: .65; }
        .nav { position: relative; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 14px 0 78px; }
        .brand { display: inline-flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 900; letter-spacing: -.04em; }
        .brand span { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 14px; background: linear-gradient(135deg, #7f5cff, #00ddff); box-shadow: 0 18px 44px rgba(0, 221, 255, .28); }
        .nav-links { display: flex; gap: 8px; padding: 6px; border: 1px solid rgba(255,255,255,.1); border-radius: 999px; background: rgba(255,255,255,.055); backdrop-filter: blur(20px); }
        .nav-links a { padding: 10px 14px; color: #c9d7ff; font-size: 14px; border-radius: 999px; transition: .2s ease; }
        .nav-links a:hover { background: rgba(255,255,255,.1); color: #fff; }
        .nav-cta { padding: 12px 18px; border-radius: 999px; border: 1px solid rgba(148, 234, 255, .28); background: rgba(0, 216, 255, .1); color: #d9f9ff; font-weight: 800; }
        .hero-grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(360px, .95fr); align-items: center; gap: clamp(36px, 5vw, 76px); }
        .hero-badge, .eyebrow { display: inline-flex; width: fit-content; align-items: center; gap: 8px; margin-bottom: 20px; padding: 9px 14px; border-radius: 999px; border: 1px solid rgba(143, 234, 255, .24); background: linear-gradient(135deg, rgba(125, 92, 255, .18), rgba(0, 216, 255, .09)); color: #bfefff; font-size: 13px; font-weight: 800; letter-spacing: .03em; text-transform: uppercase; }
        h1, h2, h3, p { margin-top: 0; }
        h1 { max-width: 880px; margin-bottom: 24px; font-size: clamp(48px, 7.4vw, 104px); line-height: .88; letter-spacing: -.085em; text-wrap: balance; }
        .lead { max-width: 760px; margin-bottom: 34px; color: #c5d2f5; font-size: clamp(18px, 2vw, 22px); line-height: 1.62; }
        .actions { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
        .actions.center { justify-content: center; }
        .btn { position: relative; display: inline-flex; align-items: center; justify-content: center; min-height: 56px; padding: 17px 24px; border-radius: 18px; font-size: 16px; font-weight: 900; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
        .btn:hover { transform: translateY(-2px); }
        .btn.primary { background: linear-gradient(135deg, #755cff, #00d9ff 54%, #66ffdf); color: #02040c; box-shadow: 0 22px 70px rgba(0, 217, 255, .34), inset 0 1px rgba(255,255,255,.65); }
        .btn.secondary { border: 1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.075); color: #f7fbff; backdrop-filter: blur(18px); }
        .hero-proof { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 32px; color: #8595c6; font-size: 14px; }
        .hero-proof strong { padding: 7px 10px; border: 1px solid rgba(255,255,255,.1); border-radius: 999px; background: rgba(255,255,255,.052); color: #dce7ff; }
        .shell-glow { position: relative; border: 1px solid rgba(255,255,255,.14); background: linear-gradient(180deg, rgba(255,255,255,.13), rgba(255,255,255,.055)); box-shadow: 0 40px 120px rgba(0,0,0,.48), 0 0 80px rgba(0, 216, 255, .12); backdrop-filter: blur(24px); }
        .dashboard { border-radius: 34px; padding: 22px; transform-style: preserve-3d; }
        .dashboard::before { content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; background: linear-gradient(135deg, rgba(255,255,255,.38), rgba(0,216,255,.08), rgba(155,92,255,.42)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; pointer-events: none; }
        .dashboard-top { display: flex; justify-content: space-between; gap: 18px; align-items: center; margin-bottom: 18px; color: #dce7ff; }
        .dashboard-top strong { padding: 6px 10px; border-radius: 999px; background: rgba(24, 255, 189, .12); color: #6dffdd; }
        .status-dot { display: inline-block; width: 9px; height: 9px; margin-right: 9px; border-radius: 50%; background: #56ffca; box-shadow: 0 0 18px #56ffca; }
        .dashboard-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .glass-tile { min-height: 152px; padding: 18px; border-radius: 24px; border: 1px solid rgba(255,255,255,.1); background: rgba(5, 8, 22, .48); box-shadow: inset 0 1px rgba(255,255,255,.07); }
        .span-2 { grid-column: span 2; }
        .tile-label { margin-bottom: 9px; color: #8798cf; font-size: 13px; text-transform: uppercase; letter-spacing: .08em; }
        .tile-value { font-size: 36px; font-weight: 950; letter-spacing: -.05em; }
        .tile-value.cyan { color: #61eaff; }
        .chart-bars { display: flex; align-items: flex-end; gap: 9px; height: 108px; margin-top: 18px; }
        .chart-bars i { flex: 1; border-radius: 999px 999px 10px 10px; background: linear-gradient(180deg, #79f2ff, #735cff); box-shadow: 0 0 28px rgba(0, 216, 255, .28); animation: barPulse 2.8s ease-in-out infinite alternate; }
        .avatar-stack { display: flex; margin: 20px 0; }
        .avatar-stack b { display: grid; place-items: center; width: 46px; height: 46px; margin-right: -10px; border: 1px solid rgba(255,255,255,.22); border-radius: 50%; background: linear-gradient(135deg, #111a3a, #1d5d79); color: #dbfbff; font-size: 12px; }
        .agent-feed p, .glass-tile small { color: #a9b7e4; line-height: 1.5; }
        .activity-card { min-height: auto; }
        .activity-row { display: flex; gap: 11px; align-items: center; padding: 10px 0; color: #d5e0ff; border-bottom: 1px solid rgba(255,255,255,.07); }
        .activity-row:last-child { border-bottom: 0; }
        .activity-row span { width: 9px; height: 9px; border-radius: 50%; background: #78f7ff; box-shadow: 0 0 18px rgba(120,247,255,.78); }
        .section { position: relative; padding: 104px min(7vw, 108px); background: #070a16; }
        .section:nth-of-type(even) { background: linear-gradient(180deg, #070a16, #090d1d); }
        .section-header { max-width: 920px; margin-bottom: 38px; }
        .section-header h2, .final-cta h2 { margin-bottom: 16px; font-size: clamp(34px, 5.2vw, 68px); line-height: .98; letter-spacing: -.064em; text-wrap: balance; }
        .section-header p, .final-cta p { max-width: 820px; color: #aebde8; font-size: 18px; line-height: 1.7; }
        .agent-grid, .pricing-grid, .metrics-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
        .agent-card, .price-card, .metric-card { border: 1px solid rgba(255,255,255,.11); border-radius: 28px; background: linear-gradient(180deg, rgba(255,255,255,.095), rgba(255,255,255,.035)); box-shadow: 0 28px 90px rgba(0,0,0,.28); backdrop-filter: blur(18px); }
        .agent-card { min-height: 300px; padding: 28px; transition: transform .25s ease, border-color .25s ease; }
        .agent-card:hover { transform: translateY(-7px); border-color: rgba(106,232,255,.34); }
        .agent-icon { display: grid; place-items: center; width: 58px; height: 58px; margin-bottom: 26px; border-radius: 20px; background: linear-gradient(135deg, rgba(125,92,255,.38), rgba(0,216,255,.18)); color: #8ef4ff; font-size: 28px; box-shadow: 0 18px 50px rgba(0, 216, 255, .16); }
        .agent-card h3, .price-card h3 { margin-bottom: 12px; font-size: 25px; letter-spacing: -.035em; }
        .agent-card p, .price-card p { color: #aebde8; line-height: 1.65; }
        .agent-pulse { display: inline-flex; gap: 8px; align-items: center; margin-top: 24px; color: #75ffda; font-size: 13px; font-weight: 800; text-transform: uppercase; }
        .agent-pulse span { width: 8px; height: 8px; border-radius: 50%; background: currentColor; box-shadow: 0 0 18px currentColor; }
        .workflow-section { overflow: hidden; }
        .workflow { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; padding: 22px; border-radius: 32px; }
        .workflow-step { position: relative; min-height: 160px; padding: 20px; border: 1px solid rgba(255,255,255,.1); border-radius: 24px; background: rgba(4, 8, 23, .52); overflow: hidden; }
        .workflow-step::before { content: ""; position: absolute; inset: auto -20% -38% -20%; height: 78%; background: radial-gradient(circle, rgba(0,216,255,.22), transparent 65%); }
        .workflow-step span { display: block; margin-bottom: 34px; color: #82ecff; font-weight: 950; }
        .workflow-step strong { position: relative; z-index: 1; display: block; font-size: 18px; }
        .workflow-step i { position: absolute; top: 50%; right: -18px; width: 32px; height: 2px; background: linear-gradient(90deg, #78efff, transparent); z-index: 2; }
        .calculator-card { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; align-items: stretch; padding: 24px; border-radius: 32px; }
        label { display: flex; flex-direction: column; gap: 12px; }
        label span { color: #bfcbef; font-weight: 800; }
        input { width: 100%; min-height: 68px; padding: 18px 20px; border: 1px solid rgba(255,255,255,.14); border-radius: 20px; outline: none; background: rgba(3, 6, 18, .64); color: #fff; font-size: 24px; font-weight: 900; box-shadow: inset 0 1px rgba(255,255,255,.06); }
        input:focus { border-color: rgba(117, 239, 255, .55); box-shadow: 0 0 0 4px rgba(0,216,255,.11); }
        .result-box { padding: 22px; border-radius: 24px; background: linear-gradient(135deg, rgba(117,92,255,.28), rgba(0,216,255,.16)); border: 1px solid rgba(143,234,255,.22); }
        .result-box span, .result-box small { display: block; color: #c8d6ff; }
        .result-box strong { display: block; margin: 8px 0; color: #75efff; font-size: clamp(30px, 4vw, 46px); letter-spacing: -.05em; }
        .pricing-grid { align-items: stretch; }
        .price-card { position: relative; padding: 30px; overflow: hidden; }
        .price-card::before { content: ""; position: absolute; inset: -40% -20% auto; height: 220px; background: radial-gradient(circle, rgba(120, 239, 255, .23), transparent 62%); opacity: .65; }
        .price-card.featured { transform: translateY(-12px); border-color: rgba(122, 239, 255, .36); box-shadow: 0 36px 120px rgba(0, 216, 255, .18); }
        .price-card.pink::before { background: radial-gradient(circle, rgba(255, 86, 205, .25), transparent 62%); }
        .price-card.violet::before { background: radial-gradient(circle, rgba(124, 92, 255, .28), transparent 62%); }
        .popular { position: relative; z-index: 1; display: inline-flex; margin-bottom: 18px; padding: 7px 10px; border-radius: 999px; background: rgba(0,216,255,.14); color: #9cf5ff; font-size: 12px; font-weight: 900; text-transform: uppercase; }
        .price-card h3, .price-card p, .price-card ul, .price-card a, .price { position: relative; z-index: 1; }
        .price { margin: 18px 0 8px; font-size: 44px; font-weight: 950; letter-spacing: -.06em; }
        .price small { color: #91a2d6; font-size: 16px; letter-spacing: 0; }
        .price-card ul { display: grid; gap: 12px; margin: 24px 0 28px; padding: 0; list-style: none; color: #d7e2ff; }
        .price-card li::before { content: "✓"; margin-right: 9px; color: #75ffda; }
        .price-card a { display: inline-flex; width: 100%; justify-content: center; padding: 15px 18px; border: 1px solid rgba(255,255,255,.15); border-radius: 17px; background: rgba(255,255,255,.08); font-weight: 900; }
        .trust-section { padding: 74px min(7vw, 108px); background: #050712; }
        .metrics-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .metric-card { padding: 26px; text-align: center; }
        .metric-card strong { display: block; margin-bottom: 8px; font-size: clamp(32px, 4.8vw, 54px); letter-spacing: -.06em; background: linear-gradient(135deg, #fff, #7defff); -webkit-background-clip: text; color: transparent; }
        .metric-card span { color: #aebde8; }
        .final-cta { padding: 104px min(7vw, 108px); background: radial-gradient(circle at 50% 0%, rgba(0,216,255,.18), transparent 38%), #070a16; text-align: center; }
        .cta-panel { max-width: 1040px; margin: 0 auto; padding: clamp(34px, 6vw, 70px); border-radius: 38px; }
        .cta-panel .eyebrow, .cta-panel p { margin-left: auto; margin-right: auto; }
        .footer { display: flex; justify-content: space-between; gap: 18px; padding: 34px min(7vw, 108px); border-top: 1px solid rgba(255,255,255,.08); background: #040610; color: #8291c5; }
        @keyframes gradientShift { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
        @keyframes floatAurora { from { transform: translate3d(0, 0, 0) scale(1); } to { transform: translate3d(5vw, -4vh, 0) scale(1.12); } }
        @keyframes particleFloat { from { transform: translateY(0) translateX(0); opacity: .25; } to { transform: translateY(-36px) translateX(18px); opacity: .95; } }
        @keyframes barPulse { from { filter: saturate(1); transform: scaleY(.92); } to { filter: saturate(1.35); transform: scaleY(1); } }
        @media (max-width: 1100px) {
          .hero-grid, .calculator-card { grid-template-columns: 1fr; }
          .dashboard { max-width: 760px; }
          .workflow { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .workflow-step i { display: none; }
          .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 820px) {
          .hero { padding: 22px 20px 72px; }
          .nav { padding-bottom: 44px; }
          .nav-links { display: none; }
          .nav-cta { display: none; }
          h1 { font-size: clamp(44px, 15vw, 70px); }
          .section, .trust-section, .final-cta { padding-left: 20px; padding-right: 20px; }
          .agent-grid, .pricing-grid, .metrics-grid, .workflow { grid-template-columns: 1fr; }
          .price-card.featured { transform: none; }
          .dashboard-grid { grid-template-columns: 1fr; }
          .span-2 { grid-column: span 1; }
          .footer { flex-direction: column; }
        }
        @media (max-width: 520px) {
          .hero-proof span { width: 100%; }
          .btn { width: 100%; }
          .dashboard, .calculator-card, .workflow, .cta-panel { border-radius: 26px; padding: 16px; }
          .glass-tile, .agent-card, .price-card { border-radius: 22px; }
          .price { font-size: 36px; }
          input { font-size: 20px; }
        }
      `}</style>
      <Hero />
      <AgentsSection />
      <WorkflowSection />
      <CalculatorSection clients={clients} setClients={setClients} price={price} setPrice={setPrice} revenue={revenue} />
      <PricingSection />
      <TrustSection />
      <FinalCta />
      <footer className="footer">
        <span>AI Bot Platform © 2026</span>
        <span>AI CRM · AI Agents · Telegram Automation · Credits</span>
      </footer>
    </main>
  );
}
