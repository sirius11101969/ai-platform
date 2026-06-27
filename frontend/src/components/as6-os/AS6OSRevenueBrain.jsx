import React from "react";

const items = [
  ["Forecast 7 дней", "1 201 390 ₽"],
  ["Hot Leads", "18"],
  ["Risk Deals", "8"],
  ["AI Score", "76"],
  ["Pipeline Health", "92%"],
  ["Recommendations", "6"],
];

export default function AS6OSRevenueBrain() {
  return (
    <section className="as6-os-panel as6-os-brain">
      <h2>AI Revenue Brain</h2>
      <div className="as6-os-brain-grid">
        {items.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="as6-os-recommendation">
        <strong>AI рекомендация</strong>
        <p>У вас 8 горячих лидов, требующих ответа. Рекомендуем отправить персональное предложение в течение 24 часов.</p>
        <button>Открыть Revenue Brain</button>
      </div>
    </section>
  );
}
