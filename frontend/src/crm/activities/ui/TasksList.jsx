import React from "react";
import { TaskCard } from "./TaskCard";

const tasks = Object.freeze([
  Object.freeze({ title: "Create proposal checklist", status: "planned", priority: "high" }),
  Object.freeze({ title: "Confirm next meeting", status: "in_progress", priority: "normal" }),
  Object.freeze({ title: "Review reminders", status: "waiting", priority: "low" }),
]);

export function TasksList() {
  return (
    <section className="as6-crm-tasks-list" aria-label="Tasks list">
      <h3>Tasks</h3>
      <div className="as6-crm-tasks-list__items">
        {tasks.map((task) => (
          <TaskCard key={task.title} {...task} />
        ))}
      </div>
    </section>
  );
}
