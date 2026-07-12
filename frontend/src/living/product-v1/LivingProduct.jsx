import React, { useMemo, useReducer, useState } from "react";
import { LivingEngine } from "../engine-v1/index.js";
import { initialLivingProductContext, reduceLivingProductContext } from "./productContext.js";
import { assertLivingProductSpace, livingProductV1Spaces } from "./productSpaces.js";

export function LivingProduct({ initialSpaceId = "focus", greeting = "Здравствуйте, Владимир." }) {
  assertLivingProductSpace(initialSpaceId);
  const [spaceId, setSpaceId] = useState(initialSpaceId);
  const [inputValue, setInputValue] = useState("");
  const [context, dispatch] = useReducer(reduceLivingProductContext, {
    ...initialLivingProductContext,
    activeSpaceId: initialSpaceId,
  });

  const activeSpace = useMemo(() => assertLivingProductSpace(spaceId), [spaceId]);

  const selectSpace = (nextSpaceId) => {
    assertLivingProductSpace(nextSpaceId);
    setSpaceId(nextSpaceId);
    dispatch({ type: "SPACE_CHANGED", spaceId: nextSpaceId });
  };

  const submitIntent = (intent) => {
    const normalized = String(intent ?? "").trim();
    if (!normalized) return;
    dispatch({ type: "INTENT_SUBMITTED", intent: normalized });
    setInputValue("");
  };

  const rightRail = (
    <div>
      <strong>{activeSpace.role}</strong>
      <p>Единый контекст сохраняется между пространствами.</p>
      <small>Событий контекста: {context.history.length}</small>
    </div>
  );

  const recommendation = context.lastIntent
    ? `AS6 понял намерение: ${context.lastIntent}`
    : "Сформулируйте цель — AS6 сохранит её при переходе между пространствами.";

  return (
    <div data-as6-product="living-product-v1" data-active-space={spaceId}>
      <LivingEngine
        spaceId={spaceId}
        greeting={greeting}
        rightRail={rightRail}
        recommendation={recommendation}
        action="Продолжить →"
        inputValue={inputValue}
        onInputChange={(event) => setInputValue(event.target.value)}
        onInputSubmit={submitIntent}
      />
      <nav aria-label="Пространства AS6 Living Product v1">
        {livingProductV1Spaces.map((space) => (
          <button
            key={space.id}
            type="button"
            aria-current={space.id === spaceId ? "page" : undefined}
            onClick={() => selectSpace(space.id)}
          >
            {space.id}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default LivingProduct;
