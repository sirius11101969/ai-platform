import React from "react";

const stages = ["Новый", "Квалификация", "Предложение", "Встреча", "Успешно"];

export default function AS6OSModuleHost() {
  return (
    <section className="as6-os-panel">
      <h2>CRM Pipeline</h2>
      <div className="as6-os-pipeline">
        {stages.map((stage, index) => (
          <article className="as6-os-stage" key={stage}>
            <header>
              <strong>{stage}</strong>
              <span>{index + 1}</span>
            </header>
            <div className="as6-os-lead">
              <strong>{index === 0 ? "Игорь Павлов" : "AS6 Lead"}</strong>
              <span>AI {index === 0 ? "100" : "81"}/100</span>
              <small>Close {index === 0 ? "23" : "71"}%</small>
            </div>
            <button>+ Добавить лид</button>
          </article>
        ))}
      </div>
    </section>
  );
}
