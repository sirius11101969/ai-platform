export const activitiesUiStates = Object.freeze({
  loading: Object.freeze({ id: "loading", label: "Loading activities", ariaLive: "polite" }),
  empty: Object.freeze({ id: "empty", label: "No activities yet", ariaLive: "polite" }),
  ready: Object.freeze({ id: "ready", label: "Activities ready", ariaLive: "polite" }),
  error: Object.freeze({ id: "error", label: "Activities unavailable", ariaLive: "assertive" }),
});
