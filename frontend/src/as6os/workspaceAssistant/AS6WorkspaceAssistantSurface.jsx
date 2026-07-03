import React from 'react';
import { activateAS6AssistantSurface, getAS6WorkspaceAssistantModel } from './assistantController.js';
import './workspaceAssistant.css';

export function AS6WorkspaceAssistantSurface({ activeSurfaceId = 'workspace.assistant.primary' }) {
  const model = getAS6WorkspaceAssistantModel();

  return (
    <section className="as6-workspace-assistant" aria-label="AS6 Assistant Surface">
      <header className="as6-workspace-assistant__header">
        <span>AS6 Assistant</span>
        <strong>Всегда знает следующий лучший шаг.</strong>
      </header>
      <div className="as6-workspace-assistant__surfaces">
        {model.surfaces.map((surface) => (
          <button key={surface.id} type="button" className={surface.id === activeSurfaceId ? 'is-active' : ''} onClick={() => activateAS6AssistantSurface(surface.id)}>
            {surface.label}
          </button>
        ))}
      </div>
      <p className="as6-workspace-assistant__note">Assistant Surface подключён к Workspace Context Bridge без бизнес-решений и CRM-логики.</p>
    </section>
  );
}

export default AS6WorkspaceAssistantSurface;
