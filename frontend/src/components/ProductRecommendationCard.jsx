const cardStyle = {
  width: '100%',
  padding: '18px 18px 18px',
  gap: '12px',
  borderRadius: '20px',
}

const summaryStyle = {
  maxWidth: '96%',
  fontSize: '12.5px',
  lineHeight: '1.36',
}

const actionStyle = {
  paddingTop: '10px',
  gap: '9px',
}

const actionTextStyle = {
  fontSize: '12.35px',
  lineHeight: '1.22',
}

const actionSmallStyle = {
  fontSize: '10.25px',
  lineHeight: '1.2',
}

const buttonStyle = {
  width: '74%',
  minHeight: '40px',
  height: '40px',
  margin: '8px auto 0',
  borderRadius: '12px',
  fontSize: '13px',
}

export default function ProductRecommendationCard({ recommendationState }) {
  const recommendation = recommendationState?.recommendation

  if (!recommendation) return null

  return (
    <article
      className="command-card as6-product-recommendation-card"
      data-as6-product-recommendation="v222-32-visual-lock"
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
        data-as6-product-recommendation-action="v222-32-visual-lock"
        style={buttonStyle}
      >
        {recommendation.actionLabel}
      </a>
    </article>
  )
}
