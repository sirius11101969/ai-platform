import React from 'react';
import { AS6WorkspaceExperienceProvider } from '../workspaceExperience/index.js';
import { getAS6WorkspaceLayoutModel } from './workspaceLayoutController.js';
import './workspaceLayout.css';

export function AS6WorkspaceLayout({ children, context = {} }) {
  const model = getAS6WorkspaceLayoutModel();

  return (
    <AS6WorkspaceExperienceProvider value={context}>
      <section className="as6-workspace-layout" data-layout-id={model.layoutId} data-responsive-mode={model.responsiveMode}>
        {model.regions.map((region) => (
          <section key={region.id} className={`as6-workspace-layout__region as6-workspace-layout__region--${region.id}`} data-active={region.active}>
            <header className="as6-workspace-layout__region-label">{region.label}</header>
            <div className="as6-workspace-layout__slots">
              {region.slots.map((slot) => (
                <div key={slot.id} className="as6-workspace-layout__slot" data-slot-id={slot.id}>
                  {region.id === 'main' && slot.id === 'workspace.main.content' ? children : slot.id}
                </div>
              ))}
            </div>
          </section>
        ))}
      </section>
    </AS6WorkspaceExperienceProvider>
  );
}

export default AS6WorkspaceLayout;
