import { Link } from "react-router-dom";
import "./AS6PublicBrandHomeV1.css";

const simpleSteps = [
  ["1", "Собирает", "Клиентов, деньги, документы и задачи."],
  ["2", "Объясняет", "Показывает, что происходит прямо сейчас."],
  ["3", "Подсказывает", "Предлагает один понятный следующий шаг."],
];

const spaces = ["Фокус", "Клиенты", "Финансы", "Документы", "Проекты", "Команда"];

function BrandOrb() {
  return (
    <div className="as6-brand-orb" aria-hidden="true">
      <i /><i /><i />
    </div>
  );
}

export default function AS6PublicBrandHomeV1() {
  return (
    <div className="as6-brand-site" data-as6-public-brand="v1">
      <header className="as6-brand-header">
        <Link to="/" className="as6-brand-logo" aria-label="AS6 — главная">
          <BrandOrb />
          <span><strong>AS6</strong><small>Спокойный бизнес</small></span>
        </Link>
        <nav aria-label="Навигация">
          <a href="#how">Как работает</a>
          <a href="#spaces">Пространства</a>
        </nav>
        <div className="as6-brand-actions">
          <Link to="/login">Войти</Link>
          <Link className="as6-brand-button" to="/signup">Попробовать</Link>
        </div>
      </header>

      <main>
        <section className="as6-brand-hero">
          <div className="as6-brand-hero-copy">
            <span className="as6-brand-kicker">AS6 понимает ваш бизнес</span>
            <h1>Ваш бизнес.<br />В одном месте.</h1>
            <p>AS6 показывает, что происходит, и помогает понять, что делать дальше.</p>
            <div className="as6-brand-hero-actions">
              <Link className="as6-brand-primary" to="/signup">Попробовать бесплатно</Link>
              <Link className="as6-brand-link" to="/preview/living">Посмотреть AS6 <span>→</span></Link>
            </div>
          </div>

          <div className="as6-brand-universe" aria-label="Бизнес в одном живом пространстве">
            <div className="as6-brand-core"><strong>Ваш бизнес</strong><small>всё связано</small></div>
            <div className="as6-brand-ring as6-brand-ring-one" />
            <div className="as6-brand-ring as6-brand-ring-two" />
            {spaces.slice(0, 4).map((space, index) => (
              <span key={space} className={`as6-brand-node as6-brand-node-${index + 1}`}>{space}</span>
            ))}
          </div>
        </section>

        <section className="as6-brand-one-line">
          <p>Меньше экранов. Меньше поиска. Больше ясности.</p>
        </section>

        <section className="as6-brand-how" id="how">
          <header>
            <span>Как работает AS6</span>
            <h2>Очень просто.</h2>
          </header>
          <div className="as6-brand-steps">
            {simpleSteps.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="as6-brand-spaces" id="spaces">
          <div className="as6-brand-space-copy">
            <span>Одно живое пространство</span>
            <h2>Всё, что важно вашему бизнесу.</h2>
            <p>Не нужно изучать десятки программ. Вы просто выбираете, что хотите увидеть.</p>
          </div>
          <div className="as6-brand-space-cloud">
            {spaces.map((space, index) => <span key={space} style={{ "--i": index }}>{space}</span>)}
            <strong>AS6</strong>
          </div>
        </section>

        <section className="as6-brand-result">
          <span>Главное обещание</span>
          <h2>Вы всегда знаете,<br />что делать дальше.</h2>
          <Link className="as6-brand-primary" to="/signup">Начать бесплатно</Link>
        </section>
      </main>

      <footer className="as6-brand-footer">
        <span>AS6</span>
        <small>© 2026. Спокойный бизнес.</small>
        <Link to="/contact">Контакты</Link>
      </footer>
    </div>
  );
}
