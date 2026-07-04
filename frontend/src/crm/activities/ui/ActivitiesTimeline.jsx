import React from "react";
import { ActivityCard } from "./ActivityCard";

const timelineItems = Object.freeze([
  Object.freeze({ title: "Follow up with contact", type: "follow_up", status: "planned", priority: "normal" }),
  Object.freeze({ title: "Prepare deal review", type: "meeting", status: "waiting", priority: "high" }),
  Object.freeze({ title: "Log discovery call", type: "call", status: "completed", priority: "normal" }),
]);

export function ActivitiesTimeline() {
  return (
    <section className="as6-crm-activities-timeline" aria-label="Activities timeline">
      <h3>Timeline</h3>
      <div className="as6-crm-activities-timeline__list">
        {timelineItems.map((item) => (
          <ActivityCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}
