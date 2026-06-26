export default function ProductRecommendationCard() {
  return (
    <article className="as6-etalon-recommendation-card" data-as6-recommendation-card="etalon-final">
      <header className="as6-etalon-recommendation-card__header">
        <h2 className="as6-etalon-recommendation-card__title">Рекомендация AS6</h2>
        <span className="as6-etalon-recommendation-card__badge">PI</span>
      </header>

      <p className="as6-etalon-recommendation-card__summary">
        AS6 рекомендует начать с проверки приоритетных лидов, потому что это самое короткое действие с прямой пользовательской ценностью.
      </p>

      <div className="as6-etalon-recommendation-card__divider" />

      <section className="as6-etalon-recommendation-card__action">
        <div className="as6-etalon-recommendation-card__icon">🧠</div>

        <div className="as6-etalon-recommendation-card__content">
          <strong className="as6-etalon-recommendation-card__action-title">
            Проверить приоритетные лиды CRM
          </strong>
          <small className="as6-etalon-recommendation-card__evidence">
            подтверждено Product Intelligence · основано на Product Evidence · связано с первым действием пользователя
          </small>
        </div>

        <b className="as6-etalon-recommendation-card__evidence-label">Evidence</b>
      </section>

      <a className="as6-etalon-recommendation-card__button" href="/crm?filter=priority">
        Открыть CRM
      </a>
    </article>
  );
}
