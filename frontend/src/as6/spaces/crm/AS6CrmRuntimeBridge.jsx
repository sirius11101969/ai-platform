import "./as6CrmRuntimeBridge.css";
import { useEffect, useMemo, useState } from "react";
import {
  activateAS6CrmLivingSpace,
  getAS6CrmLivingSpaceState,
  updateAS6CrmLivingSpaceContext,
} from "./as6CrmLivingSpaceRuntime";

export function useAS6CrmRuntimeBridge(initialContext = {}) {
  const [state, setState] = useState(() => getAS6CrmLivingSpaceState());

  const contextPatch = useMemo(
    () => ({
      currentView: "crm",
      ...initialContext,
    }),
    [initialContext],
  );

  useEffect(() => {
    const activation = activateAS6CrmLivingSpace(contextPatch);
    setState(getAS6CrmLivingSpaceState());

    if (!activation.ok) {
      setState({
        ...getAS6CrmLivingSpaceState(),
        error: activation.error || "AS6_CRM_RUNTIME_ACTIVATION_FAILED",
      });
    }
  }, [contextPatch]);

  function updateCrmContext(patch = {}) {
    updateAS6CrmLivingSpaceContext(patch);
    setState(getAS6CrmLivingSpaceState());
  }

  return {
    ...state,
    updateCrmContext,
  };
}

export function AS6CrmRuntimeStatus({ state }) {
  if (!state?.manifest) {
    return null;
  }

  return (
    <section className="as6-crm-runtime-status" data-as6-crm-runtime-status="enabled">
      <span className="as6-crm-runtime-status__label">Living Space Runtime</span>
      <strong>{state.manifest.title}</strong>
      <span>{state.runtime?.status || "registered"}</span>
      <span>{state.context?.values?.currentView || "crm"}</span>
    </section>
  );
}
