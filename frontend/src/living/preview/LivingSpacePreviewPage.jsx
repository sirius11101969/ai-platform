import React, { useMemo, useState } from "react";
import { LivingFrame, LivingGeometry, livingSpaceRegistry } from "../framework/index.js";
import "./LivingSpacePreviewPage.css";

const APPROVED_PREVIEW_SPACES = ["focus", "crm", "finance", "documents"];

const SPACE_COPY = {
  focus: {
    confidence: "72%",
    railTitle: "Картина подготовки презентации",
    railText: "Система анализирует и структурирует",
    discovery: "Финансовый прогноз подтверждает устойчивость проекта.",
    recommendation: "Посмотреть результат моделирования сценариев — это поможет усилить доверие инвесторов.",
    action: "Посмотреть результат →",
  },
  crm: {
    confidence: "88%",
    railTitle: "Картина отношений с клиентами",
    railText: "Система анализирует историю взаимодействий",
    discovery: "Найдены клиенты, готовые к следующему шагу.",
    recommendation: "Связаться с приоритетными клиентами и подтвердить следующий контакт.",
    action: "Открыть CRM →",
  },
  finance: {
    confidence: "91%",
    railTitle: "Картина финансовой устойчивости",
    railText: "Система анализирует денежные потоки и риски",
    discovery: "Ключевые финансовые показатели остаются устойчивыми.",
    recommendation: "Проверить сценарии роста без увеличения постоянных расходов.",
    action: "Показать сценарии →",
  },
  documents: {
    confidence: "95%",
    railTitle: "Картина пространства знаний",
    railText: "Система связывает документы с бизнес-контекстом",
    discovery: "Обнаружены связанные решения и документы по текущему этапу.",
    recommendation: "Открыть подборку источников, на которых основан текущий вывод.",
    action: "Посмотреть документы →",
  },
};

function RightRail({ copy }) {
  return (
    <div className="living-preview-rail">
      <h2>{copy.railTitle}</h2>
      <p>{copy.railText}</p>
      <ol>
        <li><time>09:42</time><span>Контекст пространства обновлён.</span></li>
        <li><time>09:39</time><span>Ключевые связи проверены.</span></li>
        <li><time>09:36</time><span>Подготовлена рекомендация.</span></li>
      </ol>
      <div className="living-preview-metric">
        <small>Уверенность системы</small>
        <strong>{copy.confidence}</strong>
        <span>≈ 3 мин до следующего обновления</span>
      </div>
      <h3>Последнее значимое открытие</h3>
      <p>{copy.discovery}</p>
    </div>
  );
}

function Reasoning() {
  return (
    <div className="living-preview-reasoning">
      <strong>Мышление пространства</strong>
      <div className="living-preview-reasoning__line" aria-hidden="true" />
      <div className="living-preview-reasoning__steps">
        <span>Понял задачу</span><span>Нашёл данные</span><span>Проверил связи</span><span>Подготовил решение</span><span>Осталось подтверждение</span>
      </div>
    </div>
  );
}

export default function LivingSpacePreviewPage() {
  const spaceIds = useMemo(() => APPROVED_PREVIEW_SPACES.filter((id) => livingSpaceRegistry[id]), []);
  const [spaceId, setSpaceId] = useState("focus");
  const [inputValue, setInputValue] = useState("");
  const copy = SPACE_COPY[spaceId];

  return (
    <div className="living-preview-page">
      <LivingFrame
        spaceId={spaceId}
        greeting={<><strong>Доброе утро, Владимир.</strong><span>Ваш бизнес продолжает учиться и находить новые возможности.</span></>}
        rightRail={<RightRail copy={copy} />}
        reasoning={<Reasoning />}
        recommendation={<><strong>Почему сейчас это важно</strong><p>{copy.recommendation}</p></>}
        action={copy.action}
        inputValue={inputValue}
        onInputChange={(event) => setInputValue(event.target.value)}
        onInputSubmit={() => setInputValue("")}
      >
        <LivingGeometry spaceId={spaceId} />
      </LivingFrame>

      <nav className="living-preview-page__switcher" aria-label="Переключение состояния Living Space">
        {spaceIds.map((id) => {
          const space = livingSpaceRegistry[id];
          return (
            <button
              key={id}
              type="button"
              className={id === spaceId ? "living-preview-page__button living-preview-page__button--active" : "living-preview-page__button"}
              onClick={() => setSpaceId(id)}
            >
              {space.title}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
