export default function ProductRecommendationCard({ recommendationState }) {
  const recommendation = recommendationState?.recommendation

  if (!recommendation) {
    return null
  }

  return (
    <section className="as6-product-recommendation" data-as6-product-recommendation="v222-26">
      <div className="as6-product-recommendation__eyebrow">🧠 Рекомендация AS6</div>
      <h2>{recommendation.title}</h2>
      <p>{recommendation.summary}</p>

      <ul>
        {recommendation.evidence.map((item) => (
          <li key={item}>✓ {item}</li>
        ))}
      </ul>

      <a className="as6-product-recommendation__action" href={recommendation.href}>
        {recommendation.actionLabel}
      </a>
    </section>
  )
}
