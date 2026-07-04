export const CRM_ACTIVITY_DEADLINE_REMINDER_MODEL = Object.freeze({
  deadline: Object.freeze({
    enabled: true,
    mode: "declarative-only",
    timezoneAware: true,
    storage: false,
    apiCalls: false,
  }),
  reminder: Object.freeze({
    enabled: true,
    mode: "declarative-only",
    channels: Object.freeze(["in_app_placeholder", "email_placeholder"]),
    automation: false,
    storage: false,
    apiCalls: false,
  }),
});
