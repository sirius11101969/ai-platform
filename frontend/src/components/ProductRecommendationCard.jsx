const cardStyle = {
  width: 'calc(100% - 34px)',
  maxWidth: '342px',
  marginLeft: 'auto',
  marginRight: 'auto',
  padding: '17px 18px 18px',
  gap: '12px',
  borderRadius: '19px',
}

const summaryStyle = {
  maxWidth: '88%',
  fontSize: '12.25px',
  lineHeight: '1.35',
}

const actionStyle = {
  paddingTop: '9px',
  gap: '8px',
}

const actionTextStyle = {
  fontSize: '12.25px',
  lineHeight: '1.22',
}

const actionSmallStyle = {
  fontSize: '10.25px',
  lineHeight: '1.2',
}

const buttonStyle = {
  width: '80%',
  minHeight: '42px',
  height: '42px',
  margin: '2px auto 0',
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
      data-as6-product-recommendation="v222-29-inline"
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
        data-as6-product-recommendation-action="v222-29-inline"
        style={buttonStyle}
      >
        {recommendation.actionLabel}
      </a>
    </article>
  )
}
