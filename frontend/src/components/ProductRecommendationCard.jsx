const cardStyle = {
  width: '100%',
  maxWidth: 'none',
  marginLeft: '0',
  marginRight: '0',
  padding: '18px 20px 19px',
  gap: '13px',
  borderRadius: '20px',
}

const summaryStyle = {
  maxWidth: '100%',
  fontSize: '12.75px',
  lineHeight: '1.38',
}

const actionStyle = {
  paddingTop: '10px',
  gap: '10px',
}

const actionTextStyle = {
  fontSize: '12.75px',
  lineHeight: '1.24',
}

const actionSmallStyle = {
  fontSize: '10.75px',
  lineHeight: '1.22',
}

const buttonStyle = {
  width: '86%',
  minHeight: '44px',
  height: '44px',
  margin: '4px auto 0',
  borderRadius: '13px',
  fontSize: '13.5px',
}

export default function ProductRecommendationCard({ recommendationState }) {
  const recommendation = recommendationState?.recommendation

  if (!recommendation) {
    return null
  }

  return (
    <article
      className="command-card as6-product-recommendation-card"
      data-as6-product-recommendation="v222-29-width-balance"
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
        data-as6-product-recommendation-action="v222-29-width-balance"
        style={buttonStyle}
      >
        {recommendation.actionLabel}
      </a>
    </article>
  )
}
