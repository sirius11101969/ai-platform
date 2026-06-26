const cardStyle = {
  width: '280px',
  maxWidth: '280px',
  padding: '16px 17px 17px',
  gap: '11px',
  borderRadius: '19px',
}

const summaryStyle = {
  maxWidth: '100%',
  fontSize: '12px',
  lineHeight: '1.34',
}

const actionStyle = {
  paddingTop: '9px',
  gap: '8px',
}

const actionTextStyle = {
  fontSize: '12px',
  lineHeight: '1.2',
}

const actionSmallStyle = {
  fontSize: '10px',
  lineHeight: '1.18',
}

const buttonStyle = {
  width: '210px',
  minHeight: '38px',
  height: '38px',
  margin: '8px auto 0',
  borderRadius: '11px',
  fontSize: '12.5px',
}

export default function ProductRecommendationCard({ recommendationState }) {
  const recommendation = recommendationState?.recommendation
  if (!recommendation) return null

  return (
    <article
      className="command-card as6-product-recommendation-card"
      data-as6-product-recommendation="v222-33-hard-proof"
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
        data-as6-product-recommendation-action="v222-33-hard-proof"
        style={buttonStyle}
      >
        Открыть CRM
      </a>
    </article>
  )
}
