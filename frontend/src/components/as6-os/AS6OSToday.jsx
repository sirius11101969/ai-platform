import React from "react";

const metrics = [
  ["Выручка сегодня", "$1,248,890", "+18.6%"],
  ["Новые лиды", "247", "+32%"],
  ["Сделки в работе", "87", "+14%"],
  ["AI сотрудники", "28 / 28", "Активны"],
];

export default function AS6OSToday() {
  return (
    <section className="as6-os-today">
      {metrics.map(([label, value, delta]) => (
        <article className="as6-os-metric" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          <em>{delta}</em>
        </article>
      ))}
    </section>
  );
}
