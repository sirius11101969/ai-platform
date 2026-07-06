export default function ProductRecommendationCard() {
  return (
    <article className="as6-v57-recommendation-card" data-as6-recommendation-card="v222-57-final">
      <header className="as6-v57-recommendation-card__header">
        <h2>Рекомендация AS6</h2>
        <span>PI</span>
      </header>

      <p className="as6-v57-recommendation-card__summary">
        AS6 рекомендует начать с проверки приоритетных лидов, потому что это самое короткое действие с прямой пользовательской ценностью.
      </p>

      <div className="as6-v57-recommendation-card__divider" />

      <section className="as6-v57-recommendation-card__action">
        <div className="as6-v57-recommendation-card__icon">🧠</div>

        <div className="as6-v57-recommendation-card__copy">
          <strong>Проверить приоритетные лиды CRM</strong>
          <small>
            подтверждено Product Intelligence · основано на Product Evidence · связано с первым действием пользователя
          </small>
        </div>

        <b>Evidence</b>
      </section>

      <a className="as6-v57-recommendation-card__button" href="/as6-crm?filter=priority">
        Открыть CRM
      </a>
    </article>
  );
}
