import React from "react";
import { getLivingSpaceDefinition } from "./spaceRegistry.js";
import "./livingFramework.css";

const NODE_LABELS = {
  focus: ["Продажи", "CRM", "Маркетинг", "Поддержка", "Команда", "Продукт", "Финансы", "Документы", "Филиалы"],
  crm: ["Клиенты", "Контакты", "Сделки", "Коммуникации", "Задачи", "История", "Лояльность", "Рекомендации"],
  finance: ["Доход", "Расход", "Прибыль", "Денежный поток", "Инвестиции", "Резерв", "Ликвидность", "Прогноз"],
  documents: ["Договоры", "Отчёты", "Счета", "Презентации", "Политики", "Решения", "Проекты", "Архив"],
  projects: ["Активные проекты", "Этапы", "Задачи", "Команда", "Риски", "Ресурсы", "Сроки", "Результаты"],
};

const CORE_COPY = {
  focus: ["Ваше рабочее пространство", "Готово к следующему этапу"],
  crm: ["Живые отношения", "Контекст клиентов собран"],
  finance: ["Финансовая устойчивость", "Центр принятия решений"],
  documents: ["Пространство знаний", "Документы связаны с контекстом"],
  projects: ["Развитие проектов", "Следующий этап определён"],
};

export function LivingGeometry({ spaceId = "focus" }) {
  const space = getLivingSpaceDefinition(spaceId);
  const labels = NODE_LABELS[space.id] || [];
  const [title, subtitle] = CORE_COPY[space.id] || [space.title, space.subtitle];

  return (
    <div className="as6-living-geometry" data-geometry={space.geometry} aria-label={`${space.title}: ${space.subtitle}`}>
      <div className="as6-living-geometry__connections" aria-hidden="true" />
      {labels.map((label, index) => (
        <div
          key={label}
          className="as6-living-geometry__node"
          style={{ "--node-index": index, "--node-count": labels.length }}
        >
          <span>{label}</span>
        </div>
      ))}
      <div className="as6-living-geometry__core">
        <div className="as6-living-geometry__mesh" aria-hidden="true" />
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

export default LivingGeometry;
