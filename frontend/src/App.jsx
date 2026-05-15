import React, { useMemo, useState } from "react";

export default function App() {
  const [clients, setClients] = useState(40);
  const [price, setPrice] = useState(3900);

  const revenue = useMemo(() => clients * price, [clients, price]);

  return (
    <main className="page">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, Arial, sans-serif; background: #070A12; color: #fff; }
        .page { min-height: 100vh; overflow: hidden; }
        .hero {
          padding: 56px 7vw 80px;
          background:
            radial-gradient(circle at 20% 10%, rgba(98,102,255,.35), transparent 35%),
            radial-gradient(circle at 80% 15%, rgba(0,220,255,.22), transparent 32%),
            linear-gradient(135deg, #070A12 0%, #10162A 55%, #05070D 100%);
        }
        .nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 70px; }
        .brand { font-size: 22px; font-weight: 900; letter-spacing: -.04em; }
        .badge { padding: 10px 16px; border: 1px solid rgba(255,255,255,.18); border-radius: 999px; color: #C8D3FF; background: rgba(255,255,255,.06); }
        .grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 44px; align-items: center; }
        h1 { font-size: clamp(44px, 7vw, 86px); line-height: .95; margin: 0 0 24px; letter-spacing: -.07em; }
        .lead { font-size: 21px; line-height: 1.55; color: #C9D4F6; max-width: 760px; margin-bottom: 32px; }
        .actions { display: flex; gap: 16px; flex-wrap: wrap; }
        .btn { border: 0; border-radius: 18px; padding: 17px 24px; font-weight: 800; font-size: 16px; cursor: pointer; text-decoration: none; display: inline-flex; color: #fff; }
        .primary { background: linear-gradient(135deg, #6D5DFF, #00D5FF); box-shadow: 0 18px 60px rgba(0,213,255,.26); }
        .secondary { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14); }
        .panel { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); border-radius: 32px; padding: 28px; box-shadow: 0 30px 100px rgba(0,0,0,.35); backdrop-filter: blur(18px); }
        .metric { display: flex; justify-content: space-between; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,.1); color: #DCE5FF; }
        .metric strong { color: #fff; font-size: 22px; }
        .section { padding: 80px 7vw; background: #080B14; }
        .section h2 { font-size: clamp(34px, 5vw, 58px); margin: 0 0 18px; letter-spacing: -.05em; }
        .muted { color: #9EABD8; font-size: 18px; line-height: 1.55; max-width: 820px; }
        .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 36px; }
        .card { background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.035)); border: 1px solid rgba(255,255,255,.1); border-radius: 26px; padding: 26px; min-height: 220px; }
        .icon { font-size: 34px; margin-bottom: 18px; }
        .card h3 { margin: 0 0 12px; font-size: 23px; }
        .card p { color: #AAB6DD; line-height: 1.55; margin: 0; }
        .calc { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
        input { width: 100%; padding: 18px; border-radius: 16px; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.08); color: #fff; font-size: 20px; }
        .result { margin-top: 24px; font-size: 34px; font-weight: 900; color: #63E6FF; }
        .footer { padding: 44px 7vw; color: #8C98C8; border-top: 1px solid rgba(255,255,255,.08); background: #05070D; }
        @media (max-width: 900px) {
          .grid, .cards, .calc { grid-template-columns: 1fr; }
          .nav { margin-bottom: 44px; }
        }
      `}</style>

      <section className="hero">
        <nav className="nav">
          <div className="brand">AI Bot Platform</div>
          <div className="badge">AI Agents · CRM · Automation</div>
        </nav>

        <div className="grid">
          <div>
            <h1>Премиальная AI-платформа для продаж, CRM и автоматизации</h1>
            <p className="lead">
              Запускайте AI-агентов, автоматизируйте заявки, ведите клиентов в CRM,
              подключайте Telegram-ботов и создавайте систему, которая помогает бизнесу
              продавать быстрее и работать без ручной рутины.
            </p>
            <div className="actions">
              <a className="btn primary" href="https://t.me/" target="_blank">Открыть Telegram-бота</a>
              <a className="btn secondary" href="#pricing">Посмотреть тарифы</a>
            </div>
          </div>

          <div className="panel">
            <div className="metric"><span>AI-агенты</span><strong>24/7</strong></div>
            <div className="metric"><span>CRM-заявки</span><strong>Auto</strong></div>
            <div className="metric"><span>Контент и продажи</span><strong>AI</strong></div>
            <div className="metric"><span>Telegram-воронка</span><strong>Ready</strong></div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Что умеет платформа</h2>
        <p className="muted">
          Это не просто сайт. Это основа AI-бизнеса: лендинг, CRM, заявки,
          платежи, кредиты, AI-задачи и будущая сеть агентов.
        </p>

        <div className="cards">
          <div className="card">
            <div className="icon">🤖</div>
            <h3>AI-агенты</h3>
            <p>Секретарь, продавец, маркетолог и оператор поддержки в единой автоматизированной системе.</p>
          </div>
          <div className="card">
            <div className="icon">📈</div>
            <h3>CRM и заявки</h3>
            <p>Сбор лидов, статусы, заметки, история активности и контроль продаж.</p>
          </div>
          <div className="card">
            <div className="icon">⚡</div>
            <h3>Автоматизация</h3>
            <p>Telegram, формы, платежи, уведомления и сценарии для масштабирования бизнеса.</p>
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <h2>Калькулятор дохода</h2>
        <p className="muted">Посчитайте потенциальную месячную выручку от подписок.</p>

        <div className="calc">
          <input type="number" value={clients} onChange={(e) => setClients(Number(e.target.value))} />
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </div>

        <div className="result">
          Доход: {revenue.toLocaleString("ru-RU")} ₽ / мес
        </div>
      </section>

      <section className="section">
        <h2>Тарифы для запуска</h2>
        <div className="cards">
          <div className="card"><h3>Starter</h3><p>60 credits · для первого запуска и теста спроса.</p></div>
          <div className="card"><h3>Pro</h3><p>180 credits · оптимальный тариф для активной работы.</p></div>
          <div className="card"><h3>Business</h3><p>450 credits · для команд, CRM и масштабирования AI-агентов.</p></div>
        </div>
      </section>

      <footer className="footer">
        AI Bot Platform © 2026 · AI CRM · AI Agents · Automation
      </footer>
    </main>
  );
}
