import React from "react";
import AS6Workspace from "../components/as6/AS6Workspace";

export default function AS6WorkspacePage() {
  return (
    <AS6Workspace
      title="AS6 Operating System"
      subtitle="Единый рабочий центр AS6: модули, фокус, ассистент и следующий лучший шаг."
      rightRail={
        <div className="as6-assistant">
          <strong>AS6 Assistant</strong>
          <p>Готов принимать CRM, Revenue, Dashboard и Command Center в единую платформенную оболочку.</p>
        </div>
      }
    >
      <div className="as6-placeholder">
        <strong>Workspace integration active</strong>
        <p>AS6 Workspace подключён как маршрут и готов к миграции CRM на общий foundation.</p>
      </div>
    </AS6Workspace>
  );
}
