import React from "react";
import "../../styles/as6-os-foundation.css";

const navItems = [
  "Command Center",
  "Dashboard",
  "CRM-воронка",
  "AI сотрудники",
  "AI Revenue Intelligence",
  "Revenue Dashboard",
  "AI Pipeline Copilot",
  "AI Follow-ups",
  "AI Priority Inbox",
];

export default function AS6OSShell({ children }) {
  return (
    <div className="as6-os">
      <aside className="as6-os-sidebar">
        <div className="as6-os-logo">AS6<span>AI PLATFORM</span></div>
        <nav className="as6-os-nav">
          {navItems.map((item) => (
            <button key={item} className={item === "Command Center" ? "active" : ""}>{item}</button>
          ))}
        </nav>
        <div className="as6-os-owner">
          <strong>AS6 Owner</strong>
          <span>Владимир · online</span>
        </div>
        <div className="as6-os-credits">
          <span>AI-кредиты</span>
          <strong>865</strong>
        </div>
      </aside>

      <main className="as6-os-main">
        <header className="as6-os-header">
          <div>
            <span className="as6-os-eyebrow">Защищённое рабочее пространство</span>
            <h1>AI-ОС выручки <em>PRO</em></h1>
            <p>Текущее пространство: <strong>buylesson workspace</strong></p>
          </div>
          <div className="as6-os-toolbar">
            <button>Команда и тариф</button>
            <button>Поиск</button>
            <button>Уведомления</button>
            <button>AS6</button>
          </div>
        </header>
        {children}
      </main>

      <aside className="as6-os-right">
        <section className="as6-os-card as6-os-copilot">
          <span>AI Copilot</span>
          <strong>Спросить AS6</strong>
          <p>Аналитика, рекомендации и следующий лучший шаг.</p>
          <button>Спросить</button>
        </section>
        <section className="as6-os-card">
          <span>Рекомендация AS6</span>
          <strong>P1</strong>
          <p>Сфокусируйтесь на 8 горячих лидах — вероятность сделки выше 38%.</p>
          <button>Проверить лиды</button>
        </section>
        <section className="as6-os-card">
          <span>Последние события</span>
          <p>AI SDR Agent отправил письмо лиду.</p>
          <p>Сделка перемещена в переговоры.</p>
          <p>AI follow-up запланирован.</p>
        </section>
      </aside>
    </div>
  );
}
