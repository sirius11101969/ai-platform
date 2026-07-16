import { Link } from "react-router-dom";
import "./AS6PublicBrandHomeV1.css";

const spaces = ["Клиенты", "Деньги", "Документы", "Задачи", "Команда", "Проекты"];

function BrandMark() {
  return (
    <span className="as6-brand-mark" aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

export default function AS6PublicBrandHomeV1() {
  return (
    <div className="as6-brand-site" data-as6-public-brand="master-v2">
      <header className="as6-brand-header">
        <Link to="/" className="as6-brand-logo" aria-label="AS6 — главная">
          <BrandMark />
          <strong>AS6</strong>
        </Link>
        <nav aria-label="Основная навигация">
          <a href="#simple">Как работает</a>
          <a href="#space">Что внутри</a>
        </nav>
        <div className="as6-brand-actions">
          <Link to="/login">Войти</Link>
          <Link className="as6-brand-small-cta" to="/signup">Начать</Link>
        </div>
      </header>

      <main>
        <section className="as6-brand-hero" aria-labelledby="as6-brand-title">
          <div className="as6-brand-hero-copy">
            <p className="as6-brand-eyebrow">Ваш помощник для бизнеса</p>
            <h1 id="as6-brand-title">Весь бизнес.<br />В одном месте.</h1>
            <p className="as6-brand-lead">AS6 сам собирает главное и показывает, что делать дальше.</p>
            <Link className="as6-brand-primary" to="/signup">Попробовать бесплатно</Link>
            <small>Без карты. Можно уйти в любой момент.</small>
          </div>

          <div className="as6-brand-living" aria-label="Живое пространство бизнеса">
            <div className="as6-brand-glow" />
            <div className="as6-brand-orbit as6-brand-orbit-one" />
            <div className="as6-brand-orbit as6-brand-orbit-two" />
            <div className="as6-brand-core">
              <strong>Ваш бизнес</strong>
              <span>всё связано</span>
            </div>
            {spaces.slice(0, 4).map((space, index) => (
              <span key={space} className={`as6-brand-node as6-brand-node-${index + 1}`}>{space}</span>
            ))}
          </div>
        </section>

        <section className="as6-brand-simple" id="simple">
          <p>AS6 делает три простые вещи.</p>
          <div>
            <article><span>1</span><h2>Собирает</h2><p>Клиентов, деньги, документы и задачи.</p></article>
            <article><span>2</span><h2>Объясняет</h2><p>Что происходит прямо сейчас.</p></article>
            <article><span>3</span><h2>Подсказывает</h2><p>Один понятный следующий шаг.</p></article>
          </div>
        </section>

        <section className="as6-brand-space" id="space">
          <div>
            <p className="as6-brand-eyebrow">Одно живое пространство</p>
            <h2>Не нужно искать.<br />Всё уже рядом.</h2>
            <p>Вы выбираете, что хотите понять. AS6 показывает нужное без лишних экранов.</p>
          </div>
          <div className="as6-brand-space-map" aria-hidden="true">
            <strong>AS6</strong>
            {spaces.map((space, index) => <span key={space} style={{ "--i": index }}>{space}</span>)}
          </div>
        </section>

        <section className="as6-brand-finale">
          <p>Спокойно. Понятно. По делу.</p>
          <h2>Знайте, что делать дальше.</h2>
          <Link className="as6-brand-primary" to="/signup">Начать бесплатно</Link>
        </section>
      </main>

      <footer className="as6-brand-footer">
        <span>AS6</span>
        <small>© 2026</small>
        <Link to="/contact">Контакты</Link>
      </footer>
    </div>
  );
}
