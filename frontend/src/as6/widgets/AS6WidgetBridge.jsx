import { useEffect, useState } from "react";
import {
  activateAS6Widget,
  getAS6WidgetRuntimeState,
} from "./AS6WidgetRuntime";
import { registerAS6DefaultWidgets } from "./AS6WidgetRegistry";

export function useAS6WidgetRuntimeBridge(activeWidgetId = "crm.dashboard.widget", context = {}) {
  const [state, setState] = useState(() => getAS6WidgetRuntimeState());

  useEffect(() => {
    registerAS6DefaultWidgets();
    activateAS6Widget(activeWidgetId, context);
    setState(getAS6WidgetRuntimeState());
  }, [activeWidgetId, context]);

  return state;
}

export function AS6WidgetRuntimeStatus({ state }) {
  if (!state) return null;

  return (
    <section className="as6-widget-runtime-status" data-as6-widget-runtime-status="enabled">
      <span>Widget Runtime</span>
      <strong>{state.widgetCount}</strong>
      <span>widgets registered</span>
    </section>
  );
}
