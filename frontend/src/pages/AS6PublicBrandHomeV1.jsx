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

function LivingPreview() {
  return (
    <div className="as6-brand-living" aria-label="Ваш бизнес в одном живом пространстве">
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
  );
}

export default function AS6PublicBrandHomeV1() {
  return (
    <div className="as6-brand-site" data-as6-public-brand="one-v3">
      <header className="as6-brand-header">
        <Link to="/" className="as6-brand-logo" aria-label="AS6 — главная">
          <BrandMark />
          <strong>AS6</strong>
        </Link>
        <nav aria-label="Основная навигация">
          <a href="#simple">Как работает</a>
          <a href="#inside">Что внутри</a>
        </nav>
        <div className="as6-brand-actions">
          <Link to="/login">Войти</Link>
          <Link className="as6-brand-small-cta" to="/signup">Начать</Link>
        </div>
      </header>

      <main>
        <section className="as6-brand-hero" aria-labelledby="as6-brand-title">
          <div className="as6-brand-hero-copy">
            <p className="as6-brand-eyebrow">Вся работа — в одном понятном месте</p>
            <h1 id="as6-brand-title">Вы видите главное.<br />AS6 делает остальное.</h1>
            <p className="as6-brand-lead">Клиенты, деньги, документы и задачи собираются вместе. AS6 показывает один следующий шаг.</p>
            <div className="as6-brand-hero-actions">
              <Link className="as6-brand-primary" to="/signup">Попробовать бесплатно</Link>
              <Link className="as6-brand-secondary" to="/preview/living">Посмотреть, как это выглядит</Link>
            </div>
            <small>Без карты. Настройка не нужна.</small>
          </div>
          <LivingPreview />
        </section>

        <section className="as6-brand-proof" aria-label="Что получает человек">
          <p>Не нужно искать по разным программам.</p>
          <h2>Откройте AS6 — и сразу понятно, что происходит.</h2>
        </section>

        <section className="as6-brand-simple" id="simple">
          <p className="as6-brand-eyebrow">Очень просто</p>
          <div>
            <article><span>1</span><h2>Собирает</h2><p>Всё важное из вашей работы.</p></article>
            <article><span>2</span><h2>Объясняет</h2><p>Что происходит прямо сейчас.</p></article>
            <article><span>3</span><h2>Подсказывает</h2><p>Что лучше сделать дальше.</p></article>
          </div>
        </section>

        <section className="as6-brand-space" id="inside">
          <div>
            <p className="as6-brand-eyebrow">Одно живое пространство</p>
            <h2>Всё рядом.<br />Ничего лишнего.</h2>
            <p>Вы выбираете вопрос. AS6 показывает нужные связи, события и следующий шаг.</p>
          </div>
          <div className="as6-brand-space-map" aria-hidden="true">
            <strong>AS6</strong>
            {spaces.map((space, index) => <span key={space} style={{ "--i": index }}>{space}</span>)}
          </div>
        </section>

        <section className="as6-brand-finale">
          <p>Ваш бизнес может быть спокойнее.</p>
          <h2>Начните с одного понятного пространства.</h2>
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
