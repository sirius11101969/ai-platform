export default function ProductRecommendationCard() {
  return (
    <article
      className="command-card as6-product-recommendation-card"
      data-as6-product-recommendation="v222-42-reference-css-owned"
    >
      <div className="command-card-head">
        <h2>Рекомендация AS6</h2>
        <span>PI</span>
      </div>

      <p className="as6-product-recommendation-card__summary">
        AS6 рекомендует начать с проверки приоритетных лидов, потому что это самое короткое действие с прямой пользовательской ценностью.
      </p>

      <div className="next-action as6-product-recommendation-card__action">
        <b>🧠</b>
        <span>
          Проверить приоритетные лиды CRM
          <small>
            подтверждено Product Intelligence · основано на Product Evidence · связано с первым действием пользователя
          </small>
        </span>
        <strong>Evidence</strong>
      </div>

      <a
        className="copilot-action-link as6-product-recommendation-card__button"
        href="/crm?filter=priority"
        data-as6-product-recommendation-action="v222-42-reference-css-owned"
      >
        Открыть CRM
      </a>
    </article>
  );
}
