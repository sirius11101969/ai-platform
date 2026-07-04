export const CRM_ACTIVITY_LIFECYCLE = Object.freeze({
  initial: "planned",
  terminal: Object.freeze(["completed", "cancelled"]),
  transitions: Object.freeze({
    planned: Object.freeze(["in_progress", "waiting", "cancelled", "completed"]),
    in_progress: Object.freeze(["waiting", "completed", "cancelled", "overdue"]),
    waiting: Object.freeze(["in_progress", "completed", "cancelled", "overdue"]),
    overdue: Object.freeze(["in_progress", "completed", "cancelled"]),
    completed: Object.freeze([]),
    cancelled: Object.freeze([]),
  }),
});
