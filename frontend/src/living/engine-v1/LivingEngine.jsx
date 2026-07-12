import React, { useMemo } from "react";
import { LivingFrame, LivingGeometry } from "../framework/index.js";
import { compileLivingState } from "./compileLivingState.js";

const defaultReasoning = (
  <div>
    <span>Понял контекст</span> · <span>Собрал связи</span> · <span>Подготовил следующий шаг</span>
  </div>
);

export function LivingEngine({
  spaceId = "focus",
  greeting = "Здравствуйте, Владимир.",
  rightRail,
  reasoning = defaultReasoning,
  recommendation,
  action,
  inputValue = "",
  onInputChange,
  onInputSubmit,
  runtimeOverrides,
}) {
  const compiled = useMemo(
    () => compileLivingState(spaceId, runtimeOverrides),
    [spaceId, runtimeOverrides],
  );

  const { definition, runtime } = compiled;

  return (
    <LivingFrame
      spaceId={definition.id}
      greeting={greeting}
      rightRail={rightRail}
      reasoning={reasoning}
      recommendation={recommendation}
      action={action}
      inputValue={inputValue}
      onInputChange={onInputChange}
      onInputSubmit={onInputSubmit}
    >
      <LivingGeometry
        spaceId={definition.id}
        geometry={runtime.geometry}
        nodes={runtime.nodes}
        connections={runtime.connections}
        lighting={runtime.lighting}
        motion={runtime.motion}
      />
    </LivingFrame>
  );
}

export default LivingEngine;
