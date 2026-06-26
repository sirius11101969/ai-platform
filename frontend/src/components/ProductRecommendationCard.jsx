const cardStyle = {
  width: '100%',
  padding: '17px 18px 18px',
  gap: '12px',
  borderRadius: '20px',
}

const summaryStyle = {
  maxWidth: '100%',
  fontSize: '12.6px',
  lineHeight: '1.36',
}

const actionStyle = {
  paddingTop: '10px',
  gap: '9px',
}

const actionTextStyle = {
  fontSize: '12.4px',
  lineHeight: '1.22',
}

const actionSmallStyle = {
  fontSize: '10.4px',
  lineHeight: '1.2',
}

const buttonStyle = {
  width: '82%',
  minHeight: '42px',
  height: '42px',
  margin: '4px auto 0',
  borderRadius: '12px',
  fontSize: '13px',
}

export default function ProductRecommendationCard({ recommendationState }) {
  const recommendation = recommendationState?.recommendation

  if (!recommendation) {
    return null
  }

  return (
    <article
      className="command-card as6-product-recommendation-card"
      data-as6-product-recommendation="v222-30-etalon"
      style={cardStyle}
    >
      <div className="command-card-head">
        <h2>Рекомендация AS6</h2>
        <span>PI</span>
      </div>

      <p className="as6-product-recommendation-card__summary" style={summaryStyle}>
        {recommendation.summary}
      </p>

      <div className="next-action as6-product-recommendation-card__action" style={actionStyle}>
        <b>🧠</b>
        <span style={actionTextStyle}>
          {recommendation.title}
          <small style={actionSmallStyle}>{recommendation.evidence.join(' · ')}</small>
        </span>
        <strong>Evidence</strong>
      </div>

      <a
        className="copilot-action-link as6-product-recommendation-card__button"
        href={recommendation.href}
        data-as6-product-recommendation-action="v222-30-etalon"
        style={buttonStyle}
      >
        {recommendation.actionLabel}
      </a>
    </article>
  )
}
