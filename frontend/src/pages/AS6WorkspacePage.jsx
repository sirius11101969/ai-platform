import React from "react";
import AS6Workspace from "../components/as6/AS6Workspace";
import AS6LivingWorkspace from "../living/integration/AS6LivingWorkspace.jsx";

export default function AS6WorkspacePage() {
  return (
    <AS6Workspace
      title="AS6 Living Workspace"
      subtitle="Единое живое пространство AS6: Core, состояние, внимание, энергия и следующий лучший шаг."
      rightRail={
        <div className="as6-assistant">
          <strong>Sirius</strong>
          <p>Я подготовил живое пространство. Проверьте Core, активные узлы и состояние внимания.</p>
        </div>
      }
    >
      <AS6LivingWorkspace stateId="living" />
    </AS6Workspace>
  );
}
