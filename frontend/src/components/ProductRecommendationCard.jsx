export default function ProductRecommendationCard() {
  return (
    <article className="as6-ref-card" data-as6-ref-card="v222-55-etalon">
      <div className="as6-ref-card__head">
        <h2>Рекомендация AS6</h2>
        <span>PI</span>
      </div>

      <p className="as6-ref-card__text">
        AS6 рекомендует начать с проверки приоритетных лидов, потому что это самое короткое действие с прямой пользовательской ценностью.
      </p>

      <div className="as6-ref-card__line" />

      <div className="as6-ref-card__action">
        <div className="as6-ref-card__icon">🧠</div>

        <div className="as6-ref-card__copy">
          <strong>Проверить приоритетные лиды CRM</strong>
          <small>
            подтверждено Product Intelligence · основано на Product Evidence · связано с первым действием пользователя
          </small>
        </div>

        <b>Evidence</b>
      </div>

      <a className="as6-ref-card__button" href="/crm?filter=priority">
        Открыть CRM
      </a>
    </article>
  );
}
