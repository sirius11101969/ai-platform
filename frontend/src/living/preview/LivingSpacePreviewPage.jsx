import React, { useMemo, useState } from "react";
import LivingSpace from "../engine/LivingSpace.jsx";
import { as6LivingStates } from "../states/livingStates.js";
import "./LivingSpacePreviewPage.css";

export default function LivingSpacePreviewPage() {
  const stateIds = useMemo(() => Object.keys(as6LivingStates), []);
  const [stateId, setStateId] = useState("living");

  return (
    <div className="living-preview-page">
      <LivingSpace stateId={stateId} />
      <nav className="living-preview-page__switcher" aria-label="Переключение состояния Living Space">
        {stateIds.map((id) => {
          const state = as6LivingStates[id];
          return (
            <button
              key={id}
              type="button"
              className={id === stateId ? "living-preview-page__button living-preview-page__button--active" : "living-preview-page__button"}
              onClick={() => setStateId(id)}
            >
              {state.title}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
