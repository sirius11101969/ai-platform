import React from "react";
import { ActivitiesTimeline } from "./ActivitiesTimeline";
import { TasksList } from "./TasksList";

export function ActivitiesReadyState() {
  return (
    <section className="as6-crm-activities-ready" aria-label="Activities ready state">
      <ActivitiesTimeline />
      <TasksList />
    </section>
  );
}
