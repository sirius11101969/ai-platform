export default function ProductRecommendationCard({ recommendationState }) {
  const recommendation = recommendationState?.recommendation

  if (!recommendation) {
    return null
  }

  return (
    <article
      className="command-card as6-product-recommendation-card"
      data-as6-product-recommendation="v222-28"
    >
      <div className="command-card-head">
        <h2>Рекомендация AS6</h2>
        <span>PI</span>
      </div>

      <p className="as6-product-recommendation-card__summary">
        {recommendation.summary}
      </p>

      <div className="next-action as6-product-recommendation-card__action">
        <b>🧠</b>
        <span>
          {recommendation.title}
          <small>{recommendation.evidence.join(' · ')}</small>
        </span>
        <strong>Evidence</strong>
      </div>

      <a
        className="copilot-action-link as6-product-recommendation-card__button"
        href={recommendation.href}
        data-as6-product-recommendation-action="v222-28"
      >
        {recommendation.actionLabel}
      </a>
    </article>
  )
}
