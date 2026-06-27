import React from "react";
import AS6Workspace from "../components/as6/AS6Workspace";
import CRMPage from "./CRMPage";

export default function CRMWorkspacePage() {
  return (
    <AS6Workspace
      title="AS6 CRM Workspace"
      subtitle="CRM внутри единой AS6 Operating System."
      rightRail={
        <div className="as6-assistant">
          <strong>AS6 Assistant</strong>
          <p>CRM подключён к единому workspace foundation. Следующий шаг — заменить основной CRM route после визуальной проверки.</p>
        </div>
      }
    >
      <CRMPage />
    </AS6Workspace>
  );
}
