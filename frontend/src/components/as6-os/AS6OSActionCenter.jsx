import React from "react";

const actions = ["Создать лид", "Создать сделку", "Добавить задачу", "Approval Queue", "AI аналитика", "Отчёты", "Настроить AI"];

export default function AS6OSActionCenter() {
  return (
    <section className="as6-os-panel">
      <h2>AI Action Center</h2>
      <div className="as6-os-actions">
        {actions.map((action) => <button key={action}>{action}</button>)}
      </div>
    </section>
  );
}
