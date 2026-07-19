import React from "react";
import LivingSpaceEngine from "./LivingSpaceEngine.jsx";

/**
 * Dedicated Screen 2 boundary. The visual engine remains reusable, while this
 * component owns the conductor contract and can evolve independently when the
 * real plan/draft workflow is connected.
 */
export default function LivingConductorSpace({ definition, navigate, navigationContext, snapshot }) {
  return (
    <LivingSpaceEngine
      definition={definition}
      navigate={navigate}
      navigationContext={navigationContext}
      snapshot={snapshot}
    />
  );
}
